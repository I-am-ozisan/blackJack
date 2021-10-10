$(function() {
    //hit standボタンを非活性にする
    $("#hitButton").prop("disabled", true);
    $("#standButton").prop("disabled", true);
    $("#againButton").prop("disabled", true);
});
//各山札
let Deck = [];
let enemyHand = [];
let myHand = [];

//各手札の合計を格納
let myHandSum = 0;
let enemyHandSum = 0;

//結果タイトル
const winTitle = "勝利メッセージ";
const loseTitle = "敗北メッセージ";
const drowTitle = "引き分けメッセージ";

//リザルトメッセージ
const burstMessage = "burstしたのであなたの負けです";
const winMessage = "あなたの勝ちです";
const drowMessage = "引き分けです";
const loseMessage = "あなたの負けです";
const blackJackMessage = "ブラックジャックです";

//裏側表示のパス
const basePass = "img/";
const backPicturePass = "card_back.png";


/**
 * スタートボタンが押されたとき
 */
$('#startButton').on('click', function() {
    //山札の作成。
    createDeck();
    //敵味方の手札を作成。
    createDrawMyHand(2);
    createDrawEnemyHand(2);
    //手札の数値を計算。
    enemyHandSum = calcDrawHand(enemyHand);
    myHandSum = calcDrawHand(myHand);
    //ボタン無効化
    invalidButton();
    //画面表示
    displayDrawHand(myHand, true);
    displayDrawHand(enemyHand, false);
    displayHandNum(true);
    //ディーラーの1枚目を裏側表示
    displayEnemyOneHand(backPicturePass);
});

/**
 * ヒットボタンが押されたとき
 */
$("#hitButton").on("click", function() {
    //カードを一枚引く。
    createDrawMyHand(1);
    //手札の数値を計算。
    myHandSum = calcDrawHand(myHand, myHandSum);
    //画面表示
    displayDrawHand(myHand[myHand.length - 1], true);
    displayHandNum(true);
    //burst判定
    if (calcBurstHand(myHandSum)) {
        viewModalWindow(loseTitle, burstMessage);
        return false;
    }
    //blackJack判定
    if (calcBlackJack(myHandSum)) {
        viewModalWindow(winTitle, blackJackMessage);
        return false;
    }
});

/**
 * スタンドボタンが押されたとき
 */
$("#standButton").on("click", function() {
    while (enemyHandSum < 17) {
        //手札を引く
        createDrawEnemyHand(1);
        //手札の数値を計算
        enemyHandSum = calcDrawHand(enemyHand);
        //画面表示
        displayDrawHand(enemyHand[enemyHand.length - 1], false);
    }
    //一枚目を表側表示
    displayEnemyOneHand(enemyHand[0]);
    displayHandNum(false);
    //burst判定
    if (calcBurstHand(enemyHandSum)) {
        viewModalWindow(winTitle, winMessage);
        return false;
    }
    //勝敗判定処理
    let resultInfo = calcResult();
    //結果メッセージ処理
    viewModalWindow(resultInfo.resultTitle, resultInfo.resultMessage);
});

/**
 * 再戦ボタンを押されたとき
 */
$('#againButton').click(function() {
    location.reload();
});

/**
 * 山札の作成
 */
function createDeck() {
    for (let i = 1; i <= 13; i++) {
        Deck.push('card_heart_' + i + '.png');
    }
    for (let i = 1; i <= 13; i++) {
        Deck.push('card_spade_' + i + '.png');
    }
    for (let i = 1; i <= 13; i++) {
        Deck.push('card_club_' + i + '.png');
    }
    for (let i = 1; i <= 13; i++) {
        Deck.push('card_diamond_' + i + '.png');
    }
}
/**
 * 自分の手札を作成する。
 */
function createDrawMyHand(drawCardNum) {
    for (let i = 0; i < drawCardNum; i++) {
        myHand.push(drawCard());
    }
}

/**
 * 敵の手札を作成する。
 */
function createDrawEnemyHand(drawCardNum) {
    for (let i = 0; i < drawCardNum; i++) {
        enemyHand.push(drawCard());
    }
}
/**
 * ボタン無効化
 */
function invalidButton() {
    $("#startButton").prop("disabled", true);
    $("#standButton").prop("disabled", false);
    $("#hitButton").prop("disabled", false);
    $("#againButton").prop("disabled", true);
}

/**
 * すべての手札の画面を表示。
 */
function displayDrawHand(drawHand, playFlag) {
    $.each(drawHand, function(index, value) {
        let appendImgClass = '<img src=' + basePass + value + '>';
        let appendDivClass = '<div class="card-place">' + appendImgClass + '</div>';
        if (playFlag) {
            //プレイヤーのトランプを画面表示
            $("div.player-place .card-place-center").append(appendDivClass);

        } else {
            //ディーラーのトランプを画面表示
            $("div.dealer-place .card-place-center").append(appendDivClass);
        }
    });
}



/**
 *ディーラーの一枚目の手札を裏側表示 
 */
function displayEnemyOneHand(picturePass) {
    $("div.dealer-place .card-place-center .card-place").each(function(index, element) {
        if (index === 0) {
            $(this).children("img").attr("src", basePass + picturePass);
        }
    });
}

/**
 * 各プレイヤーの現在の数字を入力。
 */
function displayHandNum(playFlg) {
    if (playFlg) {
        $("#myHandNum").text(myHandSum);
    } else {
        $("#enemyHandNum").text(enemyHandSum);
    }
}

/**
 * 手札計算
 */
function calcDrawHand(drawHand) {
    //手札を計算。
    let handNum = 0;
    let drawHandSum = 0;
    let aceFlg = false;
    $.each(drawHand, function(index, value) {
        let handNum = parseInt(value.join(',').replace(/[^0-9]/g, ""));
        //11.12.13の数値の変換。
        if (handNum > 10) {
            handNum = 10;
        }
        //Aの処遇判定
        if (handNum === 1) {
            handNum = 10;
            aceFlg = true;
        }
        drawHandSum = drawHandSum + handNum;
    });
    //Aの処遇判定
    if (aceFlg && drawHandSum >= 22) {
        drawHandSum = drawHandSum - 9;
    }

    return drawHandSum;
}

/**
 * 山札からカードを引く
 */
function drawCard() {
    //山札を選択するランダム変数
    let randomDeckNum = Math.floor(Math.random() * Deck.length);
    //山札から取得する。
    let selectDeckNum = Deck.splice(randomDeckNum, 1);
    return selectDeckNum;
}

/**
 * burst判定
 */
function calcBurstHand(drawHandSum) {
    let burstFlg = false;
    if (drawHandSum >= 22) {
        burstFlg = true;
    }
    return burstFlg;
}

/**
 * ブラックジャック判定
 */
function calcBlackJack(drawHandSum) {
    let blackJackFlg = false;
    if (drawHandSum === 21) {
        blackJackFlg = true;
    }
    return blackJackFlg;

}

/**
 * 敵と味方の勝敗判定処理
 */
function calcResult() {
    let resultInfo = {};
    let myHandDifference = 21 - myHandSum;
    let enemyHandDifference = 21 - enemyHandSum;

    if (myHandDifference > enemyHandDifference) {
        //プレイヤーが負ける場合
        resultInfo = {
            resultTitle: loseTitle,
            resultMessage: loseMessage,
        }
    } else if (myHandDifference < enemyHandDifference) {
        //プレイヤが勝つ場合
        resultInfo = {
            resultTitle: winTitle,
            resultMessage: winMessage,
        }
    } else {
        //引き分けの場合
        resultInfo = {
            resultTitle: drowTitle,
            resultMessage: drowMessage,
        }
    }
    return resultInfo;
}

/**
 * モーダルウインドウの表示
 */
function viewModalWindow(title, resultMessage) {
    $("#resuleMessage p").text(resultMessage);
    $("#resuleMessage").dialog({
        modal: false,
        height: 300,
        width: 300, //モーダル表示
        title: title, //タイトル
        buttons: { //ボタン
            "閉じる": function() {
                $(this).dialog("close");
                return false;
            }
        }
    });
    $("#startButton").prop("disabled", true);
    $("#standButton").prop("disabled", true);
    $("#hitButton").prop("disabled", true);
    $("#againButton").prop("disabled", false);
}