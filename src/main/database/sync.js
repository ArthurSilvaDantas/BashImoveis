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

db.prepare(`
  CREATE TABLE IF NOT EXISTS imovel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    endereco TEXT NOT NULL,
    cidade TEXT NOT NULL,
    bairro TEXT NOT NULL,
    estado TEXT NOT NULL,
    cep VARCHAR(10),
    preco DECIMAL(15, 2) NOT NULL,
    tipo TEXT CHECK (tipo IN ('CASA', 'APARTAMENTO', 'TERRENO', 'COMERCIAL')) NOT NULL,
    status TEXT CHECK (status IN ('DISPONIVEL', 'VENDIDO', 'ALUGADO')) DEFAULT 'DISPONIVEL',
    area_m2 REAL,
    quartos INTEGER,
    banheiros INTEGER,
    vagas_garagem INTEGER,
    corretor_id INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME,
    FOREIGN KEY (corretor_id) REFERENCES corretor(usuario_id) ON DELETE SET NULL
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS imovel_imagem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imovel_id INTEGER NOT NULL,
    image_base64 TEXT NOT NULL,
    legenda TEXT,
    ordem INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (imovel_id) REFERENCES imovel(id) ON DELETE CASCADE
  );
`).run();

let client = null;
let connected = false;

const criarClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000, 
  });
};

const desconectar = async () => {
  if (client) {
    try {
      await client.end();
      console.log('Cliente PostgreSQL desconectado com sucesso.');
    } catch (err) {
      console.error('Erro ao finalizar a conexão com o cliente PostgreSQL:', err.message);
    } finally {
      client = null;
      connected = false;
    }
  }
};

const conectar = async () => {
  if (connected) {
    return;
  }

  await desconectar();

  try {
    console.log("Tentando conectar ao banco de dados remoto...");
    client = criarClient();

    client.on('error', async (err) => {
      console.error('Erro inesperado na conexão com o banco de dados remoto:', err.message);
      await desconectar();
    });

    await client.connect();
    console.log('Conectado com sucesso ao banco de dados remoto!');
    connected = true;

  } catch (err) {
    console.error('Falha ao conectar ao banco de dados remoto:', err.message);
    await desconectar();
  }
};


const formatUpdatedAt = (updatedAt) => {
  if (!updatedAt) return null;
  return new Date(updatedAt).toISOString();
};

const formatBirthdate = (birthdate) => {
  if (!birthdate) return null;
  return new Date(birthdate).toISOString().split('T')[0];
};

export const sincronizar = async () => {
  if (!isConnected()) {
    console.log("Sincronização ignorada: sem conexão com o banco remoto.");
    return;
  }

  try {
    const pendentes = db.prepare("SELECT * FROM usuario WHERE status_sync = 'pendente'").all();
    if(pendentes.length === 0) {
        return;
    }

    console.log(`Iniciando sincronização de ${pendentes.length} registros...`);

    for (const usuario of pendentes) {
      const formattedUpdatedAt = formatUpdatedAt(usuario.updated_at);
      const formattedBirthdate = formatBirthdate(usuario.birthdate);

      if (usuario.deleted === 1) {
        await client.query(`DELETE FROM corretor WHERE usuario_id = $1`, [usuario.id]);
        await client.query(`DELETE FROM usuario WHERE id = $1`, [usuario.id]);
        db.prepare(`DELETE FROM usuario WHERE id = ?`).run(usuario.id);
      } else {
        await client.query(`
          INSERT INTO usuario (id, name, email, phone, birthdate, password, role, updated_at, status_sync, deleted)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'sincronizado', 0)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            birthdate = EXCLUDED.birthdate,
            password = EXCLUDED.password,
            role = EXCLUDED.role,
            updated_at = EXCLUDED.updated_at,
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

        if (usuario.role === 'CORRETOR') {
          const corretor = db.prepare("SELECT * FROM corretor WHERE usuario_id = ?").get(usuario.id);
          if (corretor) {
            await client.query(`
              INSERT INTO corretor (usuario_id, creci, image_base64)
              VALUES ($1, $2, $3)
              ON CONFLICT (usuario_id) DO UPDATE SET
                creci = EXCLUDED.creci,
                image_base64 = EXCLUDED.image_base64
            `, [usuario.id, corretor.creci, corretor.image_base64]);
          }
        }
        
        db.prepare(`UPDATE usuario SET status_sync = 'sincronizado' WHERE id = ?`).run(usuario.id);
      }
    }

    console.log('Sincronização concluída com sucesso!');
  } catch (e) {
    console.error('Erro durante a sincronização:', e.message);
    await desconectar();
  }
};

export const reconectar = async () => {
  if (!connected) {
    await conectar();
  }
};

export const isConnected = () => connected;
