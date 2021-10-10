$(function() {
    //各山札
    var Deck = [];
    var enemyHand = [];
    var myHand = [];

    //各手札の合計を格納
    var myHandSum = 0;
    var enemyHandSum = 0;

    //hit standボタンを非活性にする
    $("#hitButton").prop("disabled", true);
    $("#standButton").prop("disabled", true);
    $("#againButton").prop("disabled", true);


    //スタートボタン押されたとき
    $('#startButton').click(function() {
        if ($('input:hidden[name="deckJudege"]').val() == 0) {
            for (var i = 1; i <= 13; i++) {
                Deck.push('ハートの' + i);
            }
            for (var i = 1; i <= 13; i++) {
                Deck.push('スペードの' + i);
            }
            for (var i = 1; i <= 13; i++) {
                Deck.push('クローバーの' + i);
            }
            for (var i = 1; i <= 13; i++) {
                Deck.push('ダイアの' + i);
            }
            for (var i = 0; i <= 1; i++) {
                enemyHand.push(draw());
                myHand.push(draw());
            }
            $("#enemyHand").text(enemyHand[1]);
            $("#myHand").text(myHand);

        }
        $('input:hidden[name="deckJudege"]').val(1);
        $("#startButton").prop("disabled", true);
        $("#standButton").prop("disabled", false);
        $("#hitButton").prop("disabled", false);
        $("#againButton").prop("disabled", false);

        //自分の手札の合計を格納している変数に保存。
        burstJudge(myHand);
        //自分の現在の数字を表示
        $("#myHandNum").text(myHandSum);
    });

    //hitボタン押されたとき
    $('#hitButton').click(function() {
        myHand.push(draw());
        $("#myHand").text(myHand);
        var judge = burstJudge(myHand, "my");
        //自分の現在の数字を表示
        $("#myHandNum").text(myHandSum);
        //burstしたかの判定
        if (judge) {
            //burstしました。
            $("#burstMessage").dialog({
                modal: false,
                height: 300,
                width: 300, //モーダル表示
                title: "敗北メッセージ", //タイトル
                buttons: { //ボタン
                    "閉じる": function() {
                        $(this).dialog("close");

                    }
                }
            });
        }
    });

    //standボタンを押されたとき
    $('#standButton').click(function() {
        //敵の手札を引く
        for (var i = 0; i <= 100; i++) {
            //すでに17以上になっていた場合
            var judge = burstJudge(enemyHand, "enemy");
            if (judge) {
                if (enemyHandSum >= 22) {
                    $("#enemyHand").text(enemyHand);
                    $("#enemyHandNum").text(enemyHandSum);
                    $("#winMessage").dialog({
                        modal: false,
                        height: 300,
                        width: 300, //モーダル表示
                        title: "敗北メッセージ", //タイトル
                        buttons: { //ボタン
                            "閉じる": function() {
                                return false;
                                $(this).dialog("close");

                            }
                        }
                    });
                }
                //判定メソッドを呼ぶ
                var whoseWin = dealJudge(myHandSum, enemyHandSum);
                break;
            }
            enemyHand.push(draw());

            var judge = burstJudge(enemyHand, "enemy");


            if (judge) {
                if (enemyHandSum >= 22) {
                    $("#winMessage").dialog({
                        modal: false,
                        height: 300,
                        width: 300, //モーダル表示
                        title: "敗北メッセージ", //タイトル
                        buttons: { //ボタン
                            "閉じる": function() {
                                $(this).dialog("close");
                                return false;
                            }
                        }
                    });
                }
                //判定メソッドを呼ぶ
                var whoseWin = dealJudge(myHandSum, enemyHandSum);
                break;
            }
        }
        //どっちが勝ったを知らせる
        if (whoseWin == "myWin") {
            $("#enemyHand").text(enemyHand);
            $("#enemyHandNum").text(enemyHandSum);
            $("#winMessage").dialog({
                modal: false,
                height: 300,
                width: 300, //モーダル表示
                title: "勝利メッセージ", //タイトル
                buttons: { //ボタン
                    "閉じる": function() {
                        $(this).dialog("close");

                        return false;
                    }
                }
            });
        }
        if (whoseWin == "drow") {
            $("#enemyHand").text(enemyHand);
            $("#enemyHandNum").text(enemyHandSum);
            $("#drowMessage").dialog({
                modal: false,
                height: 300,
                width: 300, //モーダル表示
                title: "引き分けメッセージ", //タイトル
                buttons: { //ボタン
                    "閉じる": function() {
                        $(this).dialog("close");
                        return false;
                    }
                }
            });
        }
        if (whoseWin == "enemyWin") {
            $("#enemyHand").text(enemyHand);
            $("#enemyHandNum").text(enemyHandSum);
            $("#loseMessage").dialog({
                modal: false,
                height: 300,
                width: 300, //モーダル表示
                title: "敗北メッセージ", //タイトル
                buttons: { //ボタン
                    "閉じる": function() {
                        $(this).dialog("close");
                        return false;
                    }
                }
            });
        }
    });

    //再戦ボタンを押されたとき
    $('#againButton').click(function() {
        location.reload();
    });

    //山札から手札を取得するメソッド
    function draw() {
        //山札を選択するランダム変数
        var randomDeckNum = Math.floor(Math.random() * Deck.length);
        //山札から取得する。
        var selectDeckNum = Deck.splice(randomDeckNum, 1);

        return selectDeckNum;
    }

    //手札を計算するメソッド
    function burstJudge(hand, who) {
        //手札の総カウント
        var handSumNum = 0;
        //一枚一枚手札を見る
        for (var i = 0; i < hand.length; i++) {
            const changeHandNum = hand[i];
            //文字列から数字を切り出す
            var handNum = hand[i].join(',').replace(/[^0-9]/g, "");
            //絵札が来た時の対処
            if (handNum >= 10) {
                handNum = 10;
            }
            //エースがきた場合の対処
            if (handNum == 1) {
                handNum = 0;
            }
            //足していく
            handSumNum = parseInt(handSumNum) + parseInt(handNum);
            //敵の手札の場合
        }
        //Aceの処遇を決める。
        for (var i = 0; i < hand.length; i++) {
            //文字列から数字を切り出す。
            var handNum = hand[i].join(',').replace(/[^0-9]/g, "");
            if (handNum == 1) {
                if (handSumNum <= 10) {
                    handSumNum = parseInt(handSumNum) + parseInt(11);
                } else {
                    handSumNum = parseInt(handSumNum) + parseInt(1);
                }
            }

        }
        //敵か味方の判定
        if (who == "enemy") {
            if (handSumNum >= 17) {
                enemyHandSum = handSumNum;
                return true;
            } else {
                return false;
            }
        }
        //burstしたかの判定
        if (handSumNum >= 22) {
            var burstJudge = Boolean("true");
        } else {
            var burstJudge = Boolean("");
        }
        //最後に自分の手札の合計を格納
        myHandSum = handSumNum;
        return burstJudge;
    }
    //バトル判定メソッド
    function dealJudge(myHand, enemyHand) {
        //自分の手札が21からどれだけ離れているかを数える変数
        var myHandDifference = 21 - myHand;
        //敵の手札がどれだけ離れているかを判定
        var enemyHandDifference = 21 - enemyHand;
        //敵がburstしたとき
        if (enemyHandDifference < 0) {
            return "myWin";
        }
        if (myHandDifference < enemyHandDifference) {
            //自分の勝ち
            return "myWin";
        } else if (myHandDifference == enemyHandDifference) {
            return "drow";
        } else {
            return "enemyWin";
        }
    }
});