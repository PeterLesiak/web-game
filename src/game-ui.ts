export function createUI() {
  const playerScore = document.getElementById('player-score')!;
  const enemyScore = document.getElementById('enemy-score')!;

  const state = { playerScore: 0, enemyScore: 0 };

  return {
    ...state,

    setPlayerScore(value: number) {
      playerScore.textContent = value.toString();
      this.playerScore = value;
    },

    setEnemyScore(value: number) {
      enemyScore.textContent = value.toString();
      this.enemyScore = value;
    },
  };
}
