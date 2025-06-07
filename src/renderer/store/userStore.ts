import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const id = ref<number>(-1);
  const name = ref<string>('');
  const email = ref<string>('');
  const role = ref<string>('');
  const logado = ref<boolean>(false);

  function saveToLocalStorage() {
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: id.value,
        name: name.value,
        email: email.value,
        role: role.value,
        logado: logado.value,
      })
    );
  }

  function loadFromLocalStorage() {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      id.value = parsedUser.id;
      name.value = parsedUser.name;
      email.value = parsedUser.email;
      role.value = parsedUser.role;
      logado.value = parsedUser.logado;
    }
  }

  function setUser(data: any) {
    id.value = data.id;
    name.value = data.name;
    email.value = data.email;
    role.value = data.role;
    logado.value = true;
    saveToLocalStorage();
  }

  function resetUser() {
    id.value = -1;
    name.value = '';
    email.value = '';
    role.value = '';
    logado.value = false;
    saveToLocalStorage();
  }

  return {
    id,
    name,
    email,
    role,
    logado,
    saveToLocalStorage,
    loadFromLocalStorage,
    setUser,
    resetUser
  };
});
