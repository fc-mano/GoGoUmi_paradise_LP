/**
 * 最後の一本フランクフルト（Frankfurt Grab）- Versus モード
 * VersusLogic 単体テストスイート
 */

const assert = require('assert');
const { VersusLogic } = require('./versus.js');

console.log('=== Running Frankfurt Grab VersusLogic Tests ===\n');

// 1. CONFIG 定数の検証
console.log('Test 1: CONFIG 定数の検証');
assert.strictEqual(VersusLogic.CONFIG.maxPoints, 3, '勝利条件は3本先取');
assert.strictEqual(VersusLogic.CONFIG.minWaitTimeMs, 1500, '最小待機時間は1500ms');
assert.strictEqual(VersusLogic.CONFIG.maxWaitTimeMs, 3800, '最大待機時間は3800ms');
assert.strictEqual(VersusLogic.CONFIG.foulPenaltyMs, 9999, 'お手つきペナルティは9999ms');
assert.strictEqual(VersusLogic.CONFIG.drawThresholdMs, 5, '同着判定閾値は5ms未満');
assert.strictEqual(VersusLogic.CONFIG.roundResultDurationMs, 1600, 'ラウンド結果表示時間は1600ms');
assert.strictEqual(VersusLogic.CONFIG.soundEnabled, true, 'サウンド有効フラグ');
console.log('  ✔ CONFIG passed\n');

// 2. 待機時間の計算範囲・デフォルト引数・厳密値の検証
console.log('Test 2: calculateWaitTime の範囲・境界値検証');
const waitMin = VersusLogic.calculateWaitTime(1500, 3800, () => 0.0);
const waitMid = VersusLogic.calculateWaitTime(1500, 3800, () => 0.5);
const waitMax = VersusLogic.calculateWaitTime(1500, 3800, () => 1.0);
assert.strictEqual(waitMin, 1500, 'randomFn=0.0で厳密にmin(1500)が返ること');
assert.strictEqual(waitMid, 2650, 'randomFn=0.5で中央値(2650)が返ること');
assert.strictEqual(waitMax, 3800, 'randomFn=1.0で厳密にmax(3800)が返ること');

// デフォルト引数の検証
const defaultWait = VersusLogic.calculateWaitTime();
assert.strictEqual(
    defaultWait >= VersusLogic.CONFIG.minWaitTimeMs && defaultWait <= VersusLogic.CONFIG.maxWaitTimeMs,
    true,
    '引数なし呼び出し時にデフォルト設定範囲(1500〜3800)の値が返ること'
);
console.log('  ✔ calculateWaitTime passed\n');

// 3. 反応時間計算の検証（境界値含む）
console.log('Test 3: calculateReactionTime の検証');
assert.strictEqual(VersusLogic.calculateReactionTime(1000, 1220), 220, '差分が220msと算出されること');
assert.strictEqual(VersusLogic.calculateReactionTime(1000, 950), 9999, '合図前タップは9999msのFOUL扱いになること');
// 境界値テスト
assert.strictEqual(VersusLogic.calculateReactionTime(1000, 1000), 0, '合図と同時のタップは0msと算出されること');
assert.strictEqual(VersusLogic.calculateReactionTime(1000, 999), 9999, '合図の1ms前はフライング(9999ms)扱いになること');
assert.strictEqual(VersusLogic.calculateReactionTime(1000, 1001), 1, '合図の1ms後は1msと算出されること');
console.log('  ✔ calculateReactionTime passed\n');

// 4. ラウンド判定の検証 (通常勝利)
console.log('Test 4: evaluateRound 通常勝利の検証');
const p1Fast = VersusLogic.evaluateRound({ p1Time: 230, p2Time: 280, p1Foul: false, p2Foul: false });
assert.strictEqual(p1Fast.winner, 'p1', 'P1が速い場合はP1勝利');
assert.strictEqual(p1Fast.p1Point, 1, 'P1に1ポイント');
assert.strictEqual(p1Fast.p2Point, 0, 'P2は0ポイント');
assert.strictEqual(p1Fast.diffMs, 50, '差分は50ms');

const p2Fast = VersusLogic.evaluateRound({ p1Time: 310, p2Time: 260, p1Foul: false, p2Foul: false });
assert.strictEqual(p2Fast.winner, 'p2', 'P2が速い場合はP2勝利');
assert.strictEqual(p2Fast.p1Point, 0, 'P1は0ポイント');
assert.strictEqual(p2Fast.p2Point, 1, 'P2に1ポイント');
assert.strictEqual(p2Fast.diffMs, 50, '差分は50ms');
console.log('  ✔ 通常勝利 passed\n');

// 5. ラウンド判定の検証 (同着判定の厳密な境界値: 閾値5ms)
console.log('Test 5: evaluateRound 同着(DRAW)の境界値検証');
// 完全同着 (diffMs = 0)
const drawExact0 = VersusLogic.evaluateRound({ p1Time: 250, p2Time: 250, p1Foul: false, p2Foul: false });
assert.strictEqual(drawExact0.winner, 'draw', '0ms差は同着引き分け');
assert.strictEqual(drawExact0.diffMs, 0);

// 閾値未満 (diffMs = 4 < 5) -> DRAW
const drawExact4 = VersusLogic.evaluateRound({ p1Time: 250, p2Time: 254, p1Foul: false, p2Foul: false });
assert.strictEqual(drawExact4.winner, 'draw', '4ms差は同着引き分け');
assert.strictEqual(drawExact4.diffMs, 4);

// 閾値丁度 (diffMs = 5 >= 5) -> 通常勝敗 (P1勝ち)
const winExact5P1 = VersusLogic.evaluateRound({ p1Time: 250, p2Time: 255, p1Foul: false, p2Foul: false });
assert.strictEqual(winExact5P1.winner, 'p1', '5ms差は同着にならずP1勝利');
assert.strictEqual(winExact5P1.p1Point, 1);
assert.strictEqual(winExact5P1.diffMs, 5);

// 閾値丁度 (diffMs = 5 >= 5) -> 通常勝敗 (P2勝ち)
const winExact5P2 = VersusLogic.evaluateRound({ p1Time: 255, p2Time: 250, p1Foul: false, p2Foul: false });
assert.strictEqual(winExact5P2.winner, 'p2', '5ms差は同着にならずP2勝利');
assert.strictEqual(winExact5P2.p2Point, 1);
assert.strictEqual(winExact5P2.diffMs, 5);
console.log('  ✔ 同着境界値 passed\n');

// 6. ラウンド判定の検証 (お手つき・警告システム: P1 & P2 対称性検証)
console.log('Test 6: evaluateRound お手つき(FOUL・警告制)の対称性検証');
// 1回目のお手つき: 警告のみで得点変動なし（仕切り直し）
const p1FirstFoul = VersusLogic.evaluateRound({ p1Time: 9999, p2Time: 300, p1Foul: true, p2Foul: false, p1Warnings: 0, p2Warnings: 0 });
assert.strictEqual(p1FirstFoul.winner, 'none', 'P1の1回目お手つきは仕切り直し');
assert.strictEqual(p1FirstFoul.p1Point, 0);
assert.strictEqual(p1FirstFoul.p2Point, 0);
assert.strictEqual(p1FirstFoul.p1AddWarning, 1, 'P1に警告+1');
assert.strictEqual(p1FirstFoul.p2AddWarning, 0);
assert.strictEqual(p1FirstFoul.reason, 'p1_warning');

const p2FirstFoul = VersusLogic.evaluateRound({ p1Time: 250, p2Time: 9999, p1Foul: false, p2Foul: true, p1Warnings: 0, p2Warnings: 0 });
assert.strictEqual(p2FirstFoul.winner, 'none', 'P2の1回目お手つきは仕切り直し');
assert.strictEqual(p2FirstFoul.p1Point, 0);
assert.strictEqual(p2FirstFoul.p2Point, 0);
assert.strictEqual(p2FirstFoul.p1AddWarning, 0);
assert.strictEqual(p2FirstFoul.p2AddWarning, 1, 'P2に警告+1');
assert.strictEqual(p2FirstFoul.reason, 'p2_warning');

// 2回目のお手つき: 警告保持中に再ファウルで相手に1本献上
const p1SecondFoul = VersusLogic.evaluateRound({ p1Time: 9999, p2Time: 300, p1Foul: true, p2Foul: false, p1Warnings: 1, p2Warnings: 0 });
assert.strictEqual(p1SecondFoul.winner, 'p2', 'P1が警告保持中の再お手つきでP2が勝利');
assert.strictEqual(p1SecondFoul.p1Point, 0);
assert.strictEqual(p1SecondFoul.p2Point, 1, '相手P2に1ポイント献上');
assert.strictEqual(p1SecondFoul.p1AddWarning, -1, 'P1の警告は消化リセット');
assert.strictEqual(p1SecondFoul.p2AddWarning, 0);
assert.strictEqual(p1SecondFoul.reason, 'p1_foul_penalty');

// P2側の2回目お手つき（対称性テスト）
const p2SecondFoul = VersusLogic.evaluateRound({ p1Time: 300, p2Time: 9999, p1Foul: false, p2Foul: true, p1Warnings: 0, p2Warnings: 1 });
assert.strictEqual(p2SecondFoul.winner, 'p1', 'P2が警告保持中の再お手つきでP1が勝利');
assert.strictEqual(p2SecondFoul.p1Point, 1, '相手P1に1ポイント献上');
assert.strictEqual(p2SecondFoul.p2Point, 0);
assert.strictEqual(p2SecondFoul.p1AddWarning, 0);
assert.strictEqual(p2SecondFoul.p2AddWarning, -1, 'P2の警告は消化リセット');
assert.strictEqual(p2SecondFoul.reason, 'p2_foul_penalty');

// 両者同時お手つき
const bothFoul = VersusLogic.evaluateRound({ p1Time: 9999, p2Time: 9999, p1Foul: true, p2Foul: true, p1Warnings: 0, p2Warnings: 0 });
assert.strictEqual(bothFoul.winner, 'draw', '両者お手つき時は引き分け');
assert.strictEqual(bothFoul.p1Point, 0);
assert.strictEqual(bothFoul.p2Point, 0);
assert.strictEqual(bothFoul.p1AddWarning, 1, '両者お手つきでP1に警告+1');
assert.strictEqual(bothFoul.p2AddWarning, 1, '両者お手つきでP2に警告+1');
assert.strictEqual(bothFoul.reason, 'both_foul');
console.log('  ✔ お手つき警告対称性判定 passed\n');

// 7. スコア更新とマッチ勝者判定の検証（P1/P2、境界値、不変性）
console.log('Test 7: updateScore および checkMatchWinner の検証');
const initialScores = { p1: 0, p2: 0 };
assert.strictEqual(VersusLogic.checkMatchWinner(initialScores), null, '初期スコアは勝者なし');

// P1への加算と不変性検証
const scoreP1_1 = VersusLogic.updateScore(initialScores, p1Fast);
assert.strictEqual(scoreP1_1.p1, 1);
assert.strictEqual(scoreP1_1.p2, 0);
assert.strictEqual(initialScores.p1, 0, '元オブジェクトが破壊的変更されていないこと');

// P2への加算検証
const scoreP2_1 = VersusLogic.updateScore(initialScores, p2Fast);
assert.strictEqual(scoreP2_1.p1, 0);
assert.strictEqual(scoreP2_1.p2, 1, 'P2への1点加算が機能すること');

// リーチ境界値（2-2では勝者なし）
const matchPointScores = { p1: 2, p2: 2 };
assert.strictEqual(VersusLogic.checkMatchWinner(matchPointScores), null, '2-2のリーチ状態では勝者なし(null)');

// 3本先取達成
const p1WinScores = { p1: 3, p2: 2 };
assert.strictEqual(VersusLogic.checkMatchWinner(p1WinScores), 'p1', '3本先取でP1がマッチ勝者');

const p2WinScores = { p1: 1, p2: 3 };
assert.strictEqual(VersusLogic.checkMatchWinner(p2WinScores), 'p2', '3本先取でP2がマッチ勝者');

// 3本超過（>=）の検証
const p1OverScores = { p1: 4, p2: 0 };
assert.strictEqual(VersusLogic.checkMatchWinner(p1OverScores), 'p1', '3本を超過しても勝者判定されること');

// カスタム maxPoints の検証
assert.strictEqual(VersusLogic.checkMatchWinner({ p1: 3, p2: 3 }, 5), null, '5本先取ルールでは3点でも勝者なし');
assert.strictEqual(VersusLogic.checkMatchWinner({ p1: 5, p2: 3 }, 5), 'p1', '5本先取ルールで5点到達時にP1勝者');
console.log('  ✔ updateScore & checkMatchWinner passed\n');

// 8. 警告更新の検証（P1/P2対称性、不変性、負数クランプ）
console.log('Test 8: updateWarnings の対称性・クランプ検証');
const initialWarnings = { p1: 0, p2: 0 };

// P1 警告加算・消化
const p1Warned = VersusLogic.updateWarnings(initialWarnings, p1FirstFoul);
assert.strictEqual(p1Warned.p1, 1, 'P1の警告が1に加算');
assert.strictEqual(p1Warned.p2, 0);
assert.strictEqual(initialWarnings.p1, 0, '元オブジェクトが不変であること');

const p1Reset = VersusLogic.updateWarnings(p1Warned, p1SecondFoul);
assert.strictEqual(p1Reset.p1, 0, '2回目ファウル後にP1警告リセット');

// P2 警告加算・消化
const p2Warned = VersusLogic.updateWarnings(initialWarnings, p2FirstFoul);
assert.strictEqual(p2Warned.p1, 0);
assert.strictEqual(p2Warned.p2, 1, 'P2の警告が1に加算');

const p2Reset = VersusLogic.updateWarnings(p2Warned, p2SecondFoul);
assert.strictEqual(p2Reset.p2, 0, '2回目ファウル後にP2警告リセット');

// 負数アンダーフロー防止クランプ（Math.max(0, ...)）
const clamped = VersusLogic.updateWarnings({ p1: 0, p2: 0 }, { p1AddWarning: -5, p2AddWarning: -2 });
assert.strictEqual(clamped.p1, 0, 'マイナス警告加算時も0未満にならないこと');
assert.strictEqual(clamped.p2, 0, 'マイナス警告加算時も0未満にならないこと');
console.log('  ✔ updateWarnings passed\n');

console.log('🎉 All Frankfurt Grab VersusLogic unit tests passed successfully!');
