const ball = document.getElementById('ball');
const textBall = document.getElementById('text-ball');
const textInput = document.getElementById('text-input');
const clearText = document.getElementById('clear-text');
const jumpButton = document.getElementById('jump-button');
const trampolinePath = document.getElementById('trampoline-path');
let velocity = 0;
let gravity = 0.5;
let isJumping = false;
let ballBottom = 60;
const trampolineHeight = 90; // 트램펄린 높이 변경
let jumpForce = 12;
let canJump = true;
let idleTime = 0;
let isButtonPressed = false;
let useText = false;

// 랜덤 배경색 생성 함수
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// 텍스트 입력에 따른 공과 텍스트 표시
textInput.addEventListener('input', () => {
    if (textInput.value.length > 0) {
        textBall.textContent = textInput.value;
        textBall.style.display = 'block';
        ball.style.display = 'none';
        useText = true;
    }
});

// 엑스 버튼을 누르면 텍스트가 사라지고 공이 표시됨
clearText.addEventListener('click', () => {
    textInput.value = '';
    textBall.style.display = 'none';
    ball.style.display = 'block';
    useText = false;
});

// 점프 버튼을 누르면 실행
jumpButton.addEventListener('mousedown', () => {
    if (canJump) {
        isButtonPressed = true;
        ballBottom = trampolineHeight - 10;
        updateTrampoline(10);
        if (useText) {
            textBall.style.bottom = `${ballBottom}px`;
        } else {
            ball.style.bottom = `${ballBottom}px`;
        }
        // 배경색을 랜덤으로 변경
        document.body.style.backgroundColor = getRandomColor();
        canJump = false;
    }
});

jumpButton.addEventListener('mouseup', () => {
    if (isButtonPressed) {
        velocity = jumpForce;
        isJumping = true;
        isButtonPressed = false;
        jumpForce += 2;
    }
});

function updateTrampoline(offset = 0) {
    const curveFactor = Math.min(Math.abs(velocity) / 10, 1);
    const controlPointY = ballBottom > trampolineHeight ? 90 - curveFactor * 90 : 90 + (curveFactor * 90 + offset);
    trampolinePath.setAttribute('d', `M0,90 Q300,${controlPointY} 600,90`);
}

function gameLoop() {
    if (!isButtonPressed) {
        velocity -= gravity;
        ballBottom += velocity;
    }

    if (ballBottom <= trampolineHeight) {
        ballBottom = trampolineHeight;
        velocity = -velocity * 0.7;
        updateTrampoline();

        if (Math.abs(velocity) < 0.5) {
            velocity = 0;
            isJumping = false;
            canJump = true;
        }
    }

    if (useText) {
        textBall.style.bottom = `${ballBottom}px`;
    } else {
        ball.style.bottom = `${ballBottom}px`;
    }

    if (!isButtonPressed) {
        updateTrampoline();
    }

    if (!isJumping) {
        idleTime += 1;
        if (idleTime > 200) {
            jumpForce = 12;
        }
    } else {
        idleTime = 0;
    }

    // 텍스트가 뷰포트 바깥으로 500px 더 나갔을 때 분해되어 트램펄린 위로 떨어지는 효과 추가
    const textBallRect = textBall.getBoundingClientRect();
    if (textBallRect.bottom > window.innerHeight + 500 || textBallRect.top < -500) {
        // 텍스트 분해 처리
        splitTextIntoLetters();
        textBall.style.display = 'none';
        textInput.value = '';
        useText = false;
    }

    requestAnimationFrame(gameLoop);
}

// 텍스트를 한 글자씩 분해하여 트램펄린 위로 떨어뜨리는 함수
function splitTextIntoLetters() {
    const text = textBall.textContent;
    textBall.textContent = ''; // 기존 텍스트 비우기
    const trampolineTop = window.innerHeight - 270; // 트램펄린 위쪽에 자연스럽게 위치
    for (let i = 0; i < text.length; i++) {
        const letter = document.createElement('span');
        letter.textContent = text[i];
        letter.style.position = 'absolute';
        const randomLeft = Math.random() * 80 + 10;
        const randomDelay = Math.random() * 0.5; // 각 글자의 시작 시간에 약간의 차이
        const randomDuration = 0.4 + Math.random() * 0.4; // 각 글자의 떨어지는 속도에 약간의 차이
        letter.style.left = `${randomLeft}%`; // 랜덤으로 떨어지는 위치 설정
        letter.style.top = '-50px'; // 시작 위치 (뷰포트 상단 밖)
        letter.style.fontSize = '50px';
        letter.style.transition = `top ${randomDuration}s ease-out ${randomDelay}s`; // 속도 및 시작 시간에 차이
        document.body.appendChild(letter);

        // 애니메이션 시작: 트램펄린 위로 떨어짐
        setTimeout(() => {
            letter.style.top = `${trampolineTop}px`; // 트램펄린 위쪽에 떨어지는 위치 설정
        }, randomDelay * 1000); // 시작 시간에 약간의 차이를 주기 위해 delay 적용

        // 바닥에 떨어진 후 약간씩 옆으로 이동하는 자연스러운 모션 추가
        setTimeout(() => {
            letter.style.transition = 'left 0.2s ease-out, top 0.1s ease-out'; // 옆으로 약간 이동하고 정착
            letter.style.left = `${parseFloat(letter.style.left) + (Math.random() - 0.5) * 2}%`; // 랜덤하게 약간씩 옆으로 이동
        }, (randomDelay + randomDuration) * 1000); // 글자가 떨어진 후에 이동
    }
}

// 엑스 버튼을 누르면 텍스트가 사라지고 공이 표시됨
clearText.addEventListener('click', () => {
    textInput.value = '';
    textBall.style.display = 'none';
    ball.style.display = 'block'; // X 버튼을 눌렀을 때만 공이 생기도록 수정
    useText = false;
    removeFallenLetters(); // 떨어진 글자들 제거
});

// 텍스트 입력 시 떨어진 글자들이 사라지도록 처리
textInput.addEventListener('input', () => {
    removeFallenLetters(); // 기존 떨어진 글자들 제거
    if (textInput.value.length > 0) {
        textBall.textContent = textInput.value;
        textBall.style.display = 'block';
        ball.style.display = 'none';
        useText = true;
    }
});

// 떨어진 글자들 제거 함수
function removeFallenLetters() {
    const existingLetters = document.querySelectorAll('body > span');
    existingLetters.forEach(letter => letter.remove());
}

gameLoop();