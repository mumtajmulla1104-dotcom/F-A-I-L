// Shared utilities
function getCurrentPlayer() {
  return document.querySelector('.cell:not(.x):not(.o)') ? (document.querySelectorAll('.cell.x').length === document.querySelectorAll('.cell.o').length ? 'X' : 'O') : null;
}

function updateStatus(message) {
  const status = document.getElementById('status');
  if (status) status.textContent = message;
}

function restartGame() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
  });
  updateStatus('');
}

// Tic Tac Toe logic
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;

const winningConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function handleCellClick(index) {
  const cell = event.target;
  if (board[index] !== '' || !gameActive) return;

  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());

  if (checkWin()) {
    updateStatus(`Player ${currentPlayer} wins!`);
    updateRankings(currentPlayer === 'X' ? 1 : 0, currentPlayer === 'O' ? 1 : 0);
    gameActive = false;
    return;
  }

  if (board.every(cell => cell !== '')) {
    updateStatus('Draw!');
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus(`Player ${currentPlayer}\'s turn`);

  // AI move for competition mode (simple random)
  if (document.body.classList.contains('competition-mode') && currentPlayer === 'O') {
    setTimeout(aiMove, 500);
  }
}

function aiMove() {
  let available = [];
  board.forEach((cell, index) => {
    if (cell === '') available.push(index);
  });
  const randomIndex = available[Math.floor(Math.random() * available.length)];
  document.querySelectorAll('.cell')[randomIndex].click();
}

function checkWin() {
  return winningConditions.some(condition => {
    const [a, b, c] = condition;
    return board[a] && board[a] === board[b] && board[a] === board[c];
  });
}

// Rankings (localStorage)
let username = localStorage.getItem('username') || '';
let wins = JSON.parse(localStorage.getItem('wins') || '0');
let losses = JSON.parse(localStorage.getItem('losses') || '0');
let rankings = JSON.parse(localStorage.getItem('rankings') || '[]');

function updateRankings(newWins, newLosses) {
  wins += newWins;
  losses += newLosses;
  localStorage.setItem('wins', wins);
  localStorage.setItem('losses', losses);

  const player = { name: username || 'Anonymous', wins, losses, score: wins - losses };
  rankings = rankings.filter(r => r.name !== player.name);
  rankings.unshift(player);
  rankings = rankings.slice(0, 10); // Top 10
  localStorage.setItem('rankings', JSON.stringify(rankings));
  displayRankings();
}

function displayRankings() {
  const tbody = document.querySelector('#rankings tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  rankings.forEach((player, index) => {
    const row = tbody.insertRow();
    row.innerHTML = `<td>${index + 1}</td><td>${player.name}</td><td>${player.wins}</td><td>${player.losses}</td><td>${player.score}</td>`;
  });
}

// Login
function handleLogin() {
  username = document.getElementById('username').value.trim();
  if (username) {
    localStorage.setItem('username', username);
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('competition-game').style.display = 'block';
    document.body.classList.add('competition-mode');
    displayRankings();
    restartGame();
    updateStatus(`Welcome ${username}! Beat the AI!`);
  } else {
    showMessage('Please enter a username', 'error');
  }
}

// OTP logic
let generatedOTP = '';

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// EmailJS config - TODO: Replace placeholders after EmailJS signup
/*
emailjs.init("YOUR_PUBLIC_KEY");
*/

function sendOTP() {
  const email = document.getElementById('email')?.value.trim() || document.getElementById('phone')?.value.trim();
  if (!email) {
    showMessage('Please enter an email address', 'error');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMessage('Please enter a valid email address', 'error');
    return;
  }

  // TODO: Replace with your EmailJS credentials
  const SERVICE_ID = 'YOUR_SERVICE_ID';
  const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
  const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

  generatedOTP = generateOTP();
  console.log('Generated OTP:', generatedOTP);

  emailjs.init(PUBLIC_KEY);

  emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_email: email,
    otp: generatedOTP,
    from_name: 'Delhi Games'
  }).then(() => {
    showMessage(`OTP sent to ${email}! Check your inbox/spam. (Console: ${generatedOTP})`, 'success');
    document.getElementById('otp-section').style.display = 'block';
    document.getElementById('phone-section').style.display = 'none';
  }).catch((error) => {
    console.error('EmailJS error:', error);
    showMessage('Failed to send OTP. Check console and your EmailJS setup.', 'error');
  });
}

function verifyOTP() {
  const userOTP = document.getElementById('otp').value;
  if (userOTP === generatedOTP) {
    showMessage('Thanks for joining us!', 'success');
    document.getElementById('otp-section').style.display = 'none';
    document.getElementById('success-section').style.display = 'block';
  } else {
    showMessage('Invalid OTP. Try again.', 'error');
  }
}

function showMessage(msg, type) {
  const messageEl = document.getElementById('message');
  messageEl.textContent = msg;
  messageEl.className = type;
}

// Init
document.addEventListener('DOMContentLoaded', function() {
  // Tic Tac Toe cells
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(index));
  });

  // Rankings if present
  if (document.getElementById('rankings')) displayRankings();

  // Nav links
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = link.href;
    });
  });
});
