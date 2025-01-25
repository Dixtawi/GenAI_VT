const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function createLeaderboardTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        score INTEGER NOT NULL,
        time INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Table leaderboard créée ou déjà existante');
  } catch (error) {
    console.error('Erreur lors de la création de la table:', error);
    throw error;
  }
}

async function getLeaderboard() {
  try {
    const results = await sql`
      SELECT name, score, time 
      FROM leaderboard 
      ORDER BY score DESC, time ASC 
      LIMIT 5
    `;
    console.log('Leaderboard récupéré:', results);
    return results;
  } catch (error) {
    console.error('Erreur lors de la récupération du leaderboard:', error);
    throw error;
  }
}

async function addScore({ name, score, time }) {
  try {
    const existingPlayer = await sql`
      SELECT id, score, time 
      FROM leaderboard 
      WHERE name = ${name}
    `;

    if (existingPlayer.length > 0) {
      const player = existingPlayer[0];
      if (player.score < score || (player.score === score && player.time > time)) {
        const result = await sql`
          UPDATE leaderboard 
          SET score = ${score}, time = ${time} 
          WHERE id = ${player.id}
        `;
        console.log('Score mis à jour pour:', name);
        return result;
      }
      console.log('Pas de mise à jour nécessaire pour:', name);
      return null;
    }

    const result = await sql`
      INSERT INTO leaderboard (name, score, time) 
      VALUES (${name}, ${score}, ${time})
    `;
    console.log('Nouveau score ajouté pour:', name);
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'ajout/mise à jour du score:', error);
    throw error;
  }
}

module.exports = {
  createLeaderboardTable,
  getLeaderboard,
  addScore
}; 