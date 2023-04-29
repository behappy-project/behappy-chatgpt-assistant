/* eslint-disable */
const baseLocation = `${window.location.origin}/chat-gpt`;
const baseUrl = `${baseLocation}/api`;
const token = () => {
  return window.sessionStorage.getItem('token')
};
const environment = 'development';
