import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'bashimoveis.db'));

db.prepare(`
  CREATE TABLE IF NOT EXISTS usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    birthdate DATE,
    password VARCHAR(255) NOT NULL,
    role TEXT CHECK (role IN ('CLIENTE', 'CORRETOR', 'ADMIN')) NOT NULL,
    status_sync TEXT,
    deleted INTEGER DEFAULT 0,
    updated_at TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS corretor (
    usuario_id INTEGER PRIMARY KEY,
    creci VARCHAR(20) NOT NULL,
    image_base64 TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
  );
`).run();

let client = null;
let connected = false;

const criarClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
};

const conectar = async () => {
  try {
    client = criarClient();
    await client.connect();
    console.log('Conectado ao banco de dados remoto');
    connected = true;
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados remoto', err.message);
    connected = false;
  }
};

await conectar();

const formatUpdatedAt = (updatedAt) => {
  const date = new Date(updatedAt);
  return date.toISOString().split('.')[0].replace('T', ' ');
};

const formatBirthdate = (birthdate) => {
  if (birthdate && !isNaN(Date.parse(birthdate))) {
    const date = new Date(birthdate);
    return date.toISOString().split('T')[0];
  }
  return birthdate;
};

export const sincronizar = async () => {
  if (!connected) {
    console.log("Sincronização ignorada: sem conexão com o banco remoto");
    return;
  }

  try {
    const pendentes = db.prepare("SELECT * FROM usuario WHERE status_sync = 'pendente'").all();

    for (const usuario of pendentes) {
      try {
        const formattedUpdatedAt = formatUpdatedAt(usuario.updated_at);
        const formattedBirthdate = formatBirthdate(usuario.birthdate);

        if (usuario.deleted === 1) {
          await client.query(`DELETE FROM usuario WHERE id = $1`, [usuario.id]);
          db.prepare(`DELETE FROM usuario WHERE id = ?`).run(usuario.id);
        } else {
          await client.query(`
            INSERT INTO usuario (id, name, email, phone, birthdate, password, role, updated_at, status_sync, deleted)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'sincronizado', 0)
            ON CONFLICT (id) DO UPDATE SET
              name = $2,
              email = $3,
              phone = $4,
              birthdate = $5,
              password = $6,
              role = $7,
              updated_at = $8,
              status_sync = 'sincronizado',
              deleted = 0
          `, [
            usuario.id,
            usuario.name,
            usuario.email,
            usuario.phone,
            formattedBirthdate,
            usuario.password,
            usuario.role,
            formattedUpdatedAt,
          ]);

          db.prepare(`UPDATE usuario SET status_sync = 'sincronizado' WHERE id = ?`).run(usuario.id);
        }

        if (usuario.role === 'CORRETOR') {
          const corretor = db.prepare("SELECT * FROM corretor WHERE usuario_id = ?").get(usuario.id);

          if (corretor) {
            await client.query(`
              INSERT INTO corretor (usuario_id, creci, image_base64)
              VALUES ($1, $2, $3)
              ON CONFLICT (usuario_id) DO UPDATE SET
                creci = $2,
                image_base64 = $3
            `, [usuario.id, corretor.creci, corretor.image_base64]);
          }
        }
      } catch (e) {
        console.error(`Erro ao sincronizar usuário ID ${usuario.id}:`, e.message);
      }
    }

    const res = await client.query(`SELECT * FROM usuario`);
    const remotos = res.rows;

    for (const remoto of remotos) {
      const local = db.prepare(`SELECT * FROM usuario WHERE id = ?`).get(remoto.id);

      if (!local) {
        if (remoto.deleted === 0) {
          const formattedUpdatedAt = formatUpdatedAt(remoto.updated_at);
          const formattedBirthdate = formatBirthdate(remoto.birthdate);

          db.prepare(`
            INSERT INTO usuario (id, name, email, phone, birthdate, password, role, updated_at, status_sync, deleted)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sincronizado', 0)
          `).run(
            remoto.id,
            remoto.name,
            remoto.email,
            remoto.phone,
            formattedBirthdate,
            remoto.password,
            remoto.role,
            formattedUpdatedAt
          );
        }
      } else {
        const remotoTime = new Date(remoto.updated_at).getTime();
        const localTime = new Date(local.updated_at).getTime();

        if (remotoTime > localTime) {
          if (remoto.deleted === 1) {
            db.prepare(`DELETE FROM usuario WHERE id = ?`).run(remoto.id);
          } else {
            const formattedUpdatedAt = formatUpdatedAt(remoto.updated_at);
            const formattedBirthdate = formatBirthdate(remoto.birthdate);

            db.prepare(`
              UPDATE usuario
              SET name = ?, email = ?, phone = ?, birthdate = ?, password = ?, role = ?, updated_at = ?, status_sync = 'sincronizado', deleted = 0
              WHERE id = ?
            `).run(
              remoto.name,
              remoto.email,
              remoto.phone,
              formattedBirthdate,
              remoto.password,
              remoto.role,
              formattedUpdatedAt,
              remoto.id
            );
          }
        }
      }

      if (remoto.role === 'CORRETOR') {
        const resCreci = await client.query(`SELECT * FROM corretor WHERE usuario_id = $1`, [remoto.id]);
        const corretorRemoto = resCreci.rows[0];
        const corretorLocal = db.prepare(`SELECT * FROM corretor WHERE usuario_id = ?`).get(remoto.id);

        if (!corretorLocal && corretorRemoto) {
          db.prepare(`INSERT INTO corretor (usuario_id, creci, image_base64) VALUES (?, ?, ?)`)
            .run(remoto.id, corretorRemoto.creci, corretorRemoto.image_base64);
        } else if (corretorRemoto && (corretorLocal.creci !== corretorRemoto.creci || corretorLocal.image_base64 !== corretorRemoto.image_base64)) {
          db.prepare(`UPDATE corretor SET creci = ?, image_base64 = ? WHERE usuario_id = ?`)
            .run(corretorRemoto.creci, corretorRemoto.image_base64, remoto.id);
        }
      }
    }

    console.log('Sincronização de usuários e corretores concluída');
  } catch (e) {
    console.error('Erro na sincronização geral:', e.message);
    connected = false;
  }
};

export const reconectar = async () => {
  if (!connected) {
    await conectar();
  }
};
