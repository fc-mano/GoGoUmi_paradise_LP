/**
 * 脳バグ！後出しじゃんけん - Versus モード
 * JankenVersusLogic 単体テストスイート
 */

const assert = require('assert');
const { JankenVersusLogic } = require('./versus.js');

console.log('=== Running Janken Rush VersusLogic Tests ===\n');

// 1. CONFIG 定数およびマスタデータの検証
console.log('Test 1: CONFIG 定数およびマスタデータの検証');
assert.strictEqual(JankenVersusLogic.CONFIG.maxPoints, 3, '勝利条件は3問先取');
assert.strictEqual(JankenVersusLogic.CONFIG.roundTimeSec, 5.0, '1問あたり制限時間は5秒');
assert.strictEqual(JankenVersusLogic.CONFIG.resultDelayMs, 1200, '結果表示時間は1200ms');

assert.deepStrictEqual(JankenVersusLogic.HANDS, ['rock', 'scissors', 'paper'], '手マスタ');
assert.deepStrictEqual(JankenVersusLogic.INSTRUCTIONS, ['win', 'lose', 'draw'], '指示マスタ');
assert.strictEqual(Object.keys(JankenVersusLogic.EMOJIS).length, 3, '絵文字マスタ長');
assert.strictEqual(Object.keys(JankenVersusLogic.INSTRUCTION_LABELS).length, 3, '指示ラベルマスタ長');
console.log('  ✔ CONFIG & マスタ passed\n');

// 2. getExpectedHand の全9通りおよび異常系検証
console.log('Test 2: getExpectedHand の全通り・異常系検証');
// 相手が✊
assert.strictEqual(JankenVersusLogic.getExpectedHand('rock', 'win'), 'paper');
assert.strictEqual(JankenVersusLogic.getExpectedHand('rock', 'lose'), 'scissors');
assert.strictEqual(JankenVersusLogic.getExpectedHand('rock', 'draw'), 'rock');
// 相手が✌️
assert.strictEqual(JankenVersusLogic.getExpectedHand('scissors', 'win'), 'rock');
assert.strictEqual(JankenVersusLogic.getExpectedHand('scissors', 'lose'), 'paper');
assert.strictEqual(JankenVersusLogic.getExpectedHand('scissors', 'draw'), 'scissors');
// 相手が🖐️
assert.strictEqual(JankenVersusLogic.getExpectedHand('paper', 'win'), 'scissors');
assert.strictEqual(JankenVersusLogic.getExpectedHand('paper', 'lose'), 'rock');
assert.strictEqual(JankenVersusLogic.getExpectedHand('paper', 'draw'), 'paper');
// 異常系入力
assert.strictEqual(JankenVersusLogic.getExpectedHand('invalid_hand', 'win'), null, '不正な手にはnullが返ること');
console.log('  ✔ getExpectedHand passed\n');

// 3. generateQuestion の単体テスト（境界値・乱数モック・デフォルト引数）
console.log('Test 3: generateQuestion の単体テスト');
// 最小値境界 (0.0): 先頭要素 (rock, win)
const qMin = JankenVersusLogic.generateQuestion(null, () => 0.0);
assert.strictEqual(qMin.opponentHand, 'rock', 'randomFn=0.0で先頭の手(rock)');
assert.strictEqual(qMin.instruction, 'win', 'randomFn=0.0で先頭の指示(win)');

// 中央値 (0.5): 中央要素 (scissors, lose)
const qMid = JankenVersusLogic.generateQuestion(null, () => 0.5);
assert.strictEqual(qMid.opponentHand, 'scissors', 'randomFn=0.5で中央の手(scissors)');
assert.strictEqual(qMid.instruction, 'lose', 'randomFn=0.5で中央の指示(lose)');

// 最大値境界 (0.999): 末尾要素 (paper, draw)
const qMax = JankenVersusLogic.generateQuestion(null, () => 0.999);
assert.strictEqual(qMax.opponentHand, 'paper', 'randomFn=0.999で末尾の手(paper)');
assert.strictEqual(qMax.instruction, 'draw', 'randomFn=0.999で末尾の指示(draw)');

// デフォルト引数呼び出し
const qDefault = JankenVersusLogic.generateQuestion();
assert.strictEqual(JankenVersusLogic.HANDS.includes(qDefault.opponentHand), true, 'デフォルト生成の手がマスタに含まれること');
assert.strictEqual(JankenVersusLogic.INSTRUCTIONS.includes(qDefault.instruction), true, 'デフォルト生成の指示がマスタに含まれること');
console.log('  ✔ generateQuestion passed\n');

// 4. evaluatePlayerAnswer の検証（勝て/負けろ/あいこ パターン網羅）
console.log('Test 4: evaluatePlayerAnswer の検証（draw含む）');
// 勝て！
assert.strictEqual(JankenVersusLogic.evaluatePlayerAnswer('rock', 'win', 'paper'), true, 'グーに勝て！でパーは正解');
assert.strictEqual(JankenVersusLogic.evaluatePlayerAnswer('rock', 'win', 'rock'), false, 'グーに勝て！でグーは不正解');
// 負けろ！
assert.strictEqual(JankenVersusLogic.evaluatePlayerAnswer('scissors', 'lose', 'paper'), true, 'チョキに負けろ！でパーは正解');
assert.strictEqual(JankenVersusLogic.evaluatePlayerAnswer('scissors', 'lose', 'rock'), false, 'チョキに負けろ！でグーは不正解');
// あいこ！
assert.strictEqual(JankenVersusLogic.evaluatePlayerAnswer('rock', 'draw', 'rock'), true, 'グーにあいこ！でグーは正解');
assert.strictEqual(JankenVersusLogic.evaluatePlayerAnswer('rock', 'draw', 'paper'), false, 'グーにあいこ！でパーは不正解');
assert.strictEqual(JankenVersusLogic.evaluatePlayerAnswer('paper', 'draw', 'paper'), true, 'パーにあいこ！でパーは正解');
assert.strictEqual(JankenVersusLogic.evaluatePlayerAnswer('scissors', 'draw', 'scissors'), true, 'チョキにあいこ！でチョキは正解');
console.log('  ✔ evaluatePlayerAnswer passed\n');

// 5. evaluateAction の検証（早押し即決着・メッセージ書式検証）
console.log('Test 5: evaluateAction の検証（正解＝自分に1点、誤答＝相手に1点、メッセージ）');
// P1が正解
const p1Correct = JankenVersusLogic.evaluateAction('p1', 'rock', 'win', 'paper');
assert.strictEqual(p1Correct.winner, 'p1');
assert.strictEqual(p1Correct.p1Point, 1);
assert.strictEqual(p1Correct.p2Point, 0);
assert.strictEqual(p1Correct.isCorrect, true);
assert.strictEqual(p1Correct.message, 'P1 正解！ +1pt ✨', 'P1正解メッセージ書式');

// P1が誤答（相手P2に1点）
const p1Wrong = JankenVersusLogic.evaluateAction('p1', 'rock', 'win', 'rock');
assert.strictEqual(p1Wrong.winner, 'p2', 'P1誤答時は即座にP2に1点');
assert.strictEqual(p1Wrong.p1Point, 0);
assert.strictEqual(p1Wrong.p2Point, 1);
assert.strictEqual(p1Wrong.isCorrect, false);
assert.strictEqual(p1Wrong.message, 'P1 ミス！ P2に1点！ 💥', 'P1誤答メッセージ書式');

// P2が正解
const p2Correct = JankenVersusLogic.evaluateAction('p2', 'paper', 'lose', 'rock');
assert.strictEqual(p2Correct.winner, 'p2');
assert.strictEqual(p2Correct.p1Point, 0);
assert.strictEqual(p2Correct.p2Point, 1);
assert.strictEqual(p2Correct.isCorrect, true);
assert.strictEqual(p2Correct.message, 'P2 正解！ +1pt ✨', 'P2正解メッセージ書式');

// P2が誤答（相手P1に1点）
const p2Wrong = JankenVersusLogic.evaluateAction('p2', 'paper', 'lose', 'scissors');
assert.strictEqual(p2Wrong.winner, 'p1', 'P2誤答時は即座にP1に1点');
assert.strictEqual(p2Wrong.p1Point, 1);
assert.strictEqual(p2Wrong.p2Point, 0);
assert.strictEqual(p2Wrong.isCorrect, false);
assert.strictEqual(p2Wrong.message, 'P2 ミス！ P1に1点！ 💥', 'P2誤答メッセージ書式');
console.log('  ✔ evaluateAction passed\n');

// 6. スコア更新とマッチ勝者判定の検証（P1/P2加点、リーチ境界、超過、不変性）
console.log('Test 6: updateScore および checkMatchWinner の検証');
const initialScores = { p1: 0, p2: 0 };
assert.strictEqual(JankenVersusLogic.checkMatchWinner(initialScores), null);

// P1加点と不変性検証
const scoreP1_1 = JankenVersusLogic.updateScore(initialScores, p1Correct);
assert.strictEqual(scoreP1_1.p1, 1);
assert.strictEqual(scoreP1_1.p2, 0);
assert.strictEqual(initialScores.p1, 0, '元オブジェクトが変更されていないこと');

// P2加点検証
const scoreP2_1 = JankenVersusLogic.updateScore(initialScores, p2Correct);
assert.strictEqual(scoreP2_1.p1, 0);
assert.strictEqual(scoreP2_1.p2, 1, 'P2加点が機能すること');

// リーチ境界値（2-2では勝者なし）
const reachScores = { p1: 2, p2: 2 };
assert.strictEqual(JankenVersusLogic.checkMatchWinner(reachScores), null, '2-2ではまだ勝者なし');

// 3問先取達成
let scores = { p1: 0, p2: 0 };
scores = JankenVersusLogic.updateScore(scores, p1Correct);
scores = JankenVersusLogic.updateScore(scores, p1Correct);
scores = JankenVersusLogic.updateScore(scores, p1Correct);
assert.strictEqual(scores.p1, 3);
assert.strictEqual(JankenVersusLogic.checkMatchWinner(scores), 'p1', '3問先取でP1の勝利');

const p2WinScores = { p1: 2, p2: 3 };
assert.strictEqual(JankenVersusLogic.checkMatchWinner(p2WinScores), 'p2', 'P2が3問でP2の勝利');

// 超過ケース (4-1)
assert.strictEqual(JankenVersusLogic.checkMatchWinner({ p1: 4, p2: 1 }), 'p1', '3問超過でも勝者判定されること');

// 同時到達時（仕様としてP1判定が先に行われることの確認）
assert.strictEqual(JankenVersusLogic.checkMatchWinner({ p1: 3, p2: 3 }), 'p1', '同時到達時はP1優先');

// カスタム maxPoints
assert.strictEqual(JankenVersusLogic.checkMatchWinner({ p1: 3, p2: 2 }, 5), null, '5問先取時は3点でも勝者なし');
assert.strictEqual(JankenVersusLogic.checkMatchWinner({ p1: 5, p2: 2 }, 5), 'p1', '5問先取時は5点でP1勝者');
console.log('  ✔ スコア＆マッチ終了判定 passed\n');

console.log('🎉 All Janken Rush VersusLogic unit tests passed successfully!');
