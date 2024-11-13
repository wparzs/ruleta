document.getElementById('options').addEventListener('input', generateWheel);

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
let segments = [];
let isSpinning = false;
let currentAngle = 0;
let startTime = null;
let rotationSpeed = 0;

const totalRotations = 5; // Número de giros completos
const spinDuration = 4500; // Duración total en milisegundos (4.5 segundos) - Un segundo más que antes

// Cargar el sonido del ganador
const winnerSound = new Audio('win-sound.mp3'); // Asegúrate de tener el archivo de sonido en el mismo directorio

function generateWheel() {
    const optionsText = document.getElementById('options').value.trim();
    segments = optionsText.split('\n').filter(option => option.trim() !== '');
    drawWheel();
}

function drawWheel() {
    const numSegments = segments.length;
    if (numSegments === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    const anglePerSegment = (2 * Math.PI) / numSegments;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numSegments; i++) {
        const startAngle = i * anglePerSegment;
        const endAngle = startAngle + anglePerSegment;

        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = `hsl(${(i * 360) / numSegments}, 80%, 60%)`;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(startAngle + anglePerSegment / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#000000';
        ctx.font = '46px Arial';
        ctx.fillText(segments[i], canvas.width / 2 - 10, 10);
        ctx.restore();
    }
}

canvas.addEventListener('click', spinWheel);

function spinWheel() {
    if (isSpinning || segments.length === 0) return;
    isSpinning = true;
    currentAngle = 0; // Reiniciamos el ángulo de la rueda
    startTime = null; // Reiniciamos el tiempo de la animación
    rotationSpeed = 15; // Velocidad de inicio (rápida)
    requestAnimationFrame(animateSpin);
}

function animateSpin(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsedTime = currentTime - startTime;

    // Total de grados que deben girar (5 vueltas completas)
    const totalDegrees = totalRotations * 360;

    // Calculamos el progreso de la animación
    const progress = elapsedTime / spinDuration;

    // Ajustamos la velocidad de rotación: empieza rápida y luego desacelera
    if (progress < 0.9) {
        // En la primera parte, el giro es rápido
        rotationSpeed = 15 - (Math.pow(progress, 2) * 15); // Acelera más rápido
    } else {
        // En la segunda parte, desacelera más lentamente
        rotationSpeed = Math.max(0, rotationSpeed - (Math.pow(progress - 0.9, 2) * 30)); // Desacelera más suave
    }

    // Actualizamos el ángulo
    currentAngle += rotationSpeed;
    currentAngle = currentAngle % 360; // Mantener el ángulo dentro del rango [0, 360]

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiamos el canvas
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(currentAngle * Math.PI / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    drawWheel(); // Dibujo de la rueda con el nuevo ángulo
    ctx.restore();

    // Continuamos la animación hasta que se hayan cumplido los 4.5 segundos
    if (elapsedTime < spinDuration) {
        requestAnimationFrame(animateSpin);
    } else {
        // Aseguramos que la animación se detenga correctamente después de los 4.5 segundos
        // Forzamos el ángulo final para que siempre quede alineado con el cuarto segmento (último)
        const angleToAlignFourthSegment = 270; // 270 grados representa la posición de las 6 en punto (abajo)
        currentAngle = angleToAlignFourthSegment + (totalRotations * 360) % 360;
        isSpinning = false;
        determineWinner(); // Determinamos al ganador
    }
}

function determineWinner() {
    // El ganador siempre será el último (el cuarto segmento)
    const winner = segments[segments.length - 1]; // El último elemento siempre será el ganador

    // Reproducir sonido de ganador
    winnerSound.play();

    // Mostrar el mensaje en el modal
    const winnerMessage = document.getElementById('winnerMessage');
    winnerMessage.textContent = `¡El ganador es: ${winner}!`;

    // Mostrar el modal
    const winnerModal = document.getElementById('winnerModal');
    winnerModal.style.display = 'flex';

    // Configurar el botón de cerrar
    const closeModalButton = document.getElementById('closeModal');
    closeModalButton.addEventListener('click', () => {
        winnerModal.style.display = 'none'; // Ocultar el modal
    });
}
