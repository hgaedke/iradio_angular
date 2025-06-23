const ws = new WebSocket('ws://localhost:8081');

ws.onopen = () => {
    console.log('Test client: connected to server ws://localhost:8081');
};

ws.onclose = () => {
    console.log('Test client: disconnected from server ws://localhost:8081');
};

document.getElementById('send').addEventListener('click', () => {
    const input = document.getElementById('message');
    ws.send(input.value);
    input.value = '';
});