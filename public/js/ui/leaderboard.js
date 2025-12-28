const leaderboardList = document.getElementById('leaderboard-list');
const playersData = [
    { name: 'Alice', score: 1500 },
    { name: 'Bob', score: 1200 },
    { name: 'Charlie', score: 900 },
    { name: 'Diana', score: 800 },
    { name: 'Eve', score: 600 },
];
export function updateLeaderboard() {
    leaderboardList.innerHTML = "";
    playersData.forEach((p, i) => {
        const li = document.createElement('li');
        li.innerText = `${i + 1}. ${p.name} - ${p.score} pts`;
        leaderboardList.appendChild(li);
    });
}