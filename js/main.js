// --- 変数の準備 ---
var playerHP = 100;
var enemyHP = 100;
var winCount = 0;
var lossCount = 0;

// 音のデータを読み込んで箱（変数）に入れる
var bgm = new Audio("audio/bgm.mp3");
bgm.loop = true; 
bgm.volume = 0.3; 

var guSe = new Audio("audio/gu.mp3");
var chokiSe = new Audio("audio/choki.mp3");
var paSe = new Audio("audio/pa.mp3");

var winSe = new Audio("audio/win.mp3");
var loseSe = new Audio("audio/lose.mp3");
var criticalSe = new Audio("audio/critical.mp3");
var drawSe = new Audio("audio/draw.mp3");

// ★NEW★ BGMのON/OFFを切り替える関数
function toggleBgm() {
    var bgmBtn = document.getElementById("bgm_toggle_btn");
    
    // bgm.paused は「一時停止中ならTrue」を返す便利な機能です
    if (bgm.paused) {
        bgm.play();
        bgmBtn.innerHTML = "🔊 BGM: ON";
        bgmBtn.style.backgroundColor = "#ff5555"; // ONの時はボタンを赤くする
    } else {
        bgm.pause();
        bgmBtn.innerHTML = "🔇 BGM: OFF";
        bgmBtn.style.backgroundColor = "#333333"; // OFFの時は元の色に
    }
}

// --- バトルを実行するメインの関数 ---
function battle(playerHand) {
    if (playerHP <= 0 || enemyHP <= 0) return;

    var effectEmoji = "";
    var effectText = "";
    var effectClass = "";

    // 選んだわざに合わせて、絵文字と効果音を切り替える
    if (playerHand === 0) {
        effectEmoji = "✊";
        effectText = "ガンガンたたきぃぃぃ！！";
        effectClass = "effect-gu";
        guSe.currentTime = 0; 
        guSe.play();
    } else if (playerHand === 1) {
        effectEmoji = "✌️";
        effectText = "チョキチョキはさみぃぃぃ！！";
        effectClass = "effect-choki";
        chokiSe.currentTime = 0; 
        chokiSe.play();
    } else {
        effectEmoji = "🖐️";
        effectText = "グルグルなげぇぇぇ！！";
        effectClass = "effect-pa";
        paSe.currentTime = 0; 
        paSe.play();
    }

    // エフェクト画面に絵文字とアニメーションをセット
    var effectBox = document.getElementById("effect_emoji");
    effectBox.innerHTML = effectEmoji;
    effectBox.className = "giant-emoji " + effectClass; 
    document.getElementById("effect_text").innerHTML = effectText;

    // メイン画面を隠して、エフェクト画面をドカンと出す
    document.getElementById("main_zone").classList.add("hidden");
    document.getElementById("effect_zone").classList.remove("hidden");

    var mainImg = document.getElementById("main_battle_img");
    mainImg.className = "battle-image"; 

    // 1.2秒間エフェクトを見せた後、結果発表！
    setTimeout(function() {
        
        // エフェクトを隠して、メイン画面を再び表示
        document.getElementById("effect_zone").classList.add("hidden");
        document.getElementById("main_zone").classList.remove("hidden");

        var enemyHand = Math.floor(Math.random() * 3); 
        var damageChance = Math.floor(Math.random() * 5);
        var isCritical = (damageChance === 0);
        var damage = isCritical ? 50 : 20; 

        var resultText = "";
        var imgSrc = ""; 
        var imgEffect = ""; 

        // 勝敗判定と画像の指定
        if (playerHand === enemyHand) {
            imgSrc = "img/draw.jpg";
            resultText = "🔥 あいこ！もう一撃だ！ 🔥";
            drawSe.currentTime = 0;
            drawSe.play();
            
        } else if (
            (playerHand === 0 && enemyHand === 1) || 
            (playerHand === 1 && enemyHand === 2) || 
            (playerHand === 2 && enemyHand === 0)    
        ) {
            enemyHP -= damage;
            winCount++;
            if (isCritical) {
                imgSrc = "img/critical_win.jpg";
                resultText = "<span style='color:#ff3333;'>🌟 会心の一撃！" + damage + "の大ダメージ！ 🌟</span>";
                imgEffect = "effect-critical"; 
                criticalSe.currentTime = 0;
                criticalSe.play();
            } else {
                imgSrc = "img/win.jpg";
                resultText = "🌟 君の勝利！" + damage + "のダメージ！ 🌟";
                winSe.currentTime = 0;
                winSe.play();
            }
        } else {
            playerHP -= damage;
            lossCount++;
            if (isCritical) {
                imgSrc = "img/critical_lose.jpg";
                resultText = "<span style='color:#ff3333;'>💀 痛恨の一撃！" + damage + "の大ダメージ！ 💀</span>";
                imgEffect = "effect-critical"; 
                criticalSe.currentTime = 0;
                criticalSe.play();
            } else {
                imgSrc = "img/lose.jpg";
                resultText = "💀 負けだ..." + damage + "のダメージ！ 💀";
                loseSe.currentTime = 0;
                loseSe.play();
            }
        }

        if (playerHP < 0) playerHP = 0;
        if (enemyHP < 0) enemyHP = 0;

        // ゲーム終了判定
        if (playerHP <= 0) {
            imgSrc = "img/defeat.jpg";
            resultText += "<br>💀 バトル終了...君は力尽きた 💀";
            imgEffect = "effect-defeat"; 
            showReset(); 
            stopBgmOnGameOver(); // ★NEW★ BGMを止めてボタンもOFFにする
        } else if (enemyHP <= 0) {
            imgSrc = "img/victory.jpg";
            resultText += "<br>🏆 完全勝利！森の王者は君だ！ 🏆";
            imgEffect = "effect-victory"; 
            showReset(); 
            stopBgmOnGameOver(); // ★NEW★ BGMを止めてボタンもOFFにする
        }

        // 画面を更新！
        mainImg.src = imgSrc; 
        if (imgEffect !== "") {
            mainImg.classList.add(imgEffect); 
        }
        document.getElementById("result").innerHTML = resultText;
        
        updateStatus();

    }, 1200); 
}

// ★NEW★ ゲーム終了時にBGMを止め、ボタンの表示もOFFに戻す関数
function stopBgmOnGameOver() {
    bgm.pause();
    var bgmBtn = document.getElementById("bgm_toggle_btn");
    bgmBtn.innerHTML = "🔇 BGM: OFF";
    bgmBtn.style.backgroundColor = "#333333";
}

function updateStatus() {
    document.getElementById("player_hp").innerHTML = playerHP;
    document.getElementById("enemy_hp").innerHTML = enemyHP;
    document.getElementById("win_count").innerHTML = winCount;
    document.getElementById("loss_count").innerHTML = lossCount;

    document.getElementById("player_hp_bar").style.width = playerHP + "%";
    document.getElementById("enemy_hp_bar").style.width = enemyHP + "%";

    if (playerHP <= 30) {
        document.getElementById("player_hp_bar").style.backgroundColor = "#ff3333"; 
    } else {
        document.getElementById("player_hp_bar").style.backgroundColor = "#00ff00"; 
    }

    if (enemyHP <= 30) {
        document.getElementById("enemy_hp_bar").style.backgroundColor = "#ff3333"; 
    } else {
        document.getElementById("enemy_hp_bar").style.backgroundColor = "#00ff00"; 
    }
}

function resetGame() {
    playerHP = 100;
    enemyHP = 100;
    updateStatus();
    
    document.getElementById("reset_btn").classList.add("hidden");
    document.getElementById("result").innerHTML = "わざを選んでバトル開始だ！";
    
    var mainImg = document.getElementById("main_battle_img");
    mainImg.src = "img/start.jpg";
    mainImg.className = "battle-image";

    // BGMの再生位置を最初に戻しておく
    bgm.currentTime = 0; 
}

function showReset() {
    document.getElementById("reset_btn").classList.remove("hidden");
}

updateStatus();