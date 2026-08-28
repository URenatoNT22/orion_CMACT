// state.js — manejo de estado entre páginas via localStorage
const STATE_KEY = 'orion_state';

const State = {
  get: () => JSON.parse(localStorage.getItem(STATE_KEY) || '{}'),
  set: (data) => localStorage.setItem(STATE_KEY, JSON.stringify({ ...State.get(), ...data })),
  clear: () => localStorage.removeItem(STATE_KEY),
  reset: () => { State.clear(); window.location.href = 'index.html'; }
};
