const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const TILE = 55;

let player = { x: 2, y: 2, hp: 100, inv: [] };
let monsters = [], map = [], exit = { x: -1, y: -1, active: false };
let shake = 0;

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols = Math.floor(canvas.width / TILE);
    const rows = Math.floor(canvas.height / TILE);
    map = [];
    for(let y=0; y<rows; y++) {
        map[y] = [];
        for(let x=0; x<cols; x++) {
            map[y][x] = (x === 0 || y === 0 || x === cols-1 || y === rows-1) ? 1 : 0;
        }
    }
    monsters = [];
    for(let i=0; i<6; i++) {
        let rx, ry;
        do {
            rx = Math.floor(Math.random()*(cols-2))+1;
            ry = Math.floor(Math.random()*(rows-2))+1;
        } while (rx === player.x && ry === player.y);
        monsters.push({x: rx, y: ry, hp: 50});
    }
    exit.x = cols-2; exit.y = rows-2;
    document.getElementById('hp-val').innerText = player.hp;
    document.getElementById('m-val').innerText = monsters.length;
    document.getElementById('q-text').innerText = "DIỆT HẾT QUÁI VẬT ĐỂ THOÁT THÂN";
    msg("Chào mừng chiến binh!");
    gameLoop();
}

function msg(text, berserk = false) {
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast' + (berserk ? ' berserk-msg' : '');
    t.innerText = text;
    container.appendChild(t);
    setTimeout(() => t.remove(), 2000);
}

function combat(m, idx) {
    shake = 10;
    let dam = 20;
    let isBerserk = player.hp < 30;
    if(isBerserk) {
        dam = Math.floor(dam * 1.2);
        msg(`🔥 Bạn chém quái trừ -${dam} HP (CUỒNG NỘ)`, true);
    } else {
        msg(`Bạn chém quái trừ -${dam} HP`);
    }
    m.hp -= dam;
    if(m.hp > 0) {
        let mDam = 15;
        player.hp -= mDam;
        msg(`Quái cắn trả trừ -${mDam} HP`);
    } else {
        monsters.splice(idx, 1);
        player.inv.push("Bình Máu");
        msg("Quái gục! Nhặt được Bình Máu");
        if(monsters.length === 0) {
            exit.active = true;
            document.getElementById('q-text').innerText = "TÌM CỔNG VÀNG ĐỂ THOÁT!";
            msg("🏆 LỐI THOÁT ĐÃ MỞ!");
        }
    }
    const hpVal = document.getElementById('hp-val');
    hpVal.innerText = player.hp;
    document.getElementById('m-val').innerText = monsters.length;
    if(player.hp < 30) hpVal.classList.add('low-hp');
    else hpVal.classList.remove('low-hp');
    if(player.hp <= 0) {
        player.hp = 0; hpVal.innerText = 0;
        alert("BẠN ĐÃ TỬ TRẬN!");
        location.reload();
    }
}

function toggleInv() {
    const m = document.getElementById('inv-menu');
    m.style.display = (m.style.display === 'block') ? 'none' : 'block';
    let list = document.getElementById('inv-list');
    list.innerHTML = player.inv.length === 0 ? "Trống" : "";
    player.inv.forEach((it, i) => {
        let b = document.createElement('div');
        b.className = "potion"; b.innerText = "HỒI +20 MÁU";
        b.onclick = () => {
            player.hp = Math.min(100, player.hp + 20);
            player.inv.splice(i, 1);
            msg("🧪 +20 Máu");
            document.getElementById('hp-val').innerText = player.hp;
            toggleInv();
        };
        list.appendChild(b);
    });
}

function gameLoop() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.save();
    if(shake > 0) { ctx.translate(Math.random()*10-5, Math.random()*10-5); shake--; }
    for(let y=0; y<map.length; y++) {
        for(let x=0; x<map[y].length; x++) {
            ctx.fillStyle = map[y][x] === 1 ? "#1a1a1a" : "#333";
            ctx.fillRect(x*TILE, y*TILE, TILE-2, TILE-2);
        }
    }
    if(exit.active) {
        ctx.fillStyle = "#f1c40f";
        ctx.shadowBlur = 15; ctx.shadowColor = "gold";
        ctx.fillRect(exit.x*TILE, exit.y*TILE, TILE-2, TILE-2);
        ctx.shadowBlur = 0;
    }
    ctx.fillStyle = "red";
    monsters.forEach(m => ctx.fillRect(m.x*TILE+12, m.y*TILE+12, TILE-24, TILE-24));
    ctx.fillStyle = "#2ed573";
    if(player.hp < 30) { ctx.shadowBlur = 15; ctx.shadowColor = "red"; }
    ctx.fillRect(player.x*TILE+12, player.y*TILE+12, TILE-24, TILE-24);
    ctx.restore();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', e => {
    let nx = player.x, ny = player.y;
    if(e.key === 'ArrowUp') ny--;
    if(e.key === 'ArrowDown') ny++;
    if(e.key === 'ArrowLeft') nx--;
    if(e.key === 'ArrowRight') nx++;
    if(map[ny] && map[ny][nx] === 0) {
        let mIdx = monsters.findIndex(m => m.x === nx && m.y === ny);
        if (mIdx !== -1) combat(monsters[mIdx], mIdx);
        else if (exit.active && nx === exit.x && ny === exit.y) {
            alert("CHIẾN THẮNG!"); location.reload();
        }
        else { player.x = nx; player.y = ny; }
    }
});

init();
window.onresize = () => init();
