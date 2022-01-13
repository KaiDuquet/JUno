const log = (text) => {
    const parent = document.querySelector('#messages');
    const element = document.createElement('li');
    element.innerHTML = text;

    parent.appendChild(element);
    parent.scrollTop = parent.scrollHeight;
};

const onChatSent = (socket) => (e) => {
    e.preventDefault();

    const input = document.querySelector('#chat-input');
    const text = input.value;
    input.value = '';

    socket.emit('message', text);
};

(() => {
    const socket = io();

    socket.on('message', log)
    document.querySelector('#chat-form').addEventListener('submit', onChatSent(socket));
})();