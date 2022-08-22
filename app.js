const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let db = null;

const initializeServerAndDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeServerAndDatabase();

const gettingMoviesNames = (eachMovie) => {
  return {
    movieName: eachMovie.movie_name,
  };
};

const gettingAllDirectorNames = (eachDirector) => {
  return {
    directorId: eachDirector.director_id,
    directorName: eachDirector.director_name,
  };
};

const gettingMovieDetails = (eachMovie) => {
  return {
    movieId: eachMovie.movie_id,
    directorId: eachMovie.director_id,
    movieName: eachMovie.movie_name,
    leadActor: eachMovie.lead_actor,
  };
};
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
     movie_name
    FROM 
     movie;
    `;
  const getMovies = await db.all(getMoviesQuery);
  response.send(getMovies.map((eachMovie) => gettingAllMoviesNames(eachMovie)));
});

app.get("/movies/:moviesId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
    *
    FROM 
    movie
    WHERE 
    movie_id = ${movieId};
    `;
  const getMovie = await db.get(getMoviesQuery);
  response.send(gettingMovieDetails(getMovie));
});

app.post("/movies/", async (request, response) => {
  const { movieName, directorId, leadActor } = request.body;
  const postMovieQuery = `
    INSERT INTO 
    movie (director_id, movie_name, lead_actor) 
    VALUES (${directorId}, ${movieName}, ${leadActor});
    `;
  const postMovie = await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;

  const updateMovieQuery = `
    UPDATE
    movie
    SET
    director_id = ${directorId},
    movie_name = ${movieName},
    lead_actor = ${leadActor}    
    WHERE 
    movie_id = ${movieId}`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
DELETE FROM movie
WHERE movie_id = ${movieId}
`;
  const deleteMovie = await bd.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT 
    *
    FROM 
    director;
    `;
  const getDirectors = await db.all(getDirectorsQuery);
  response.send(
    getDirectors.map((eachDirector) => gettingAllDirectorNames(eachDirector))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectedMoviesQuery = `
    SELECT 
    movie_name
    FROM 
    movie
    WHERE
    director_id = ${directorId} ;
    `;
  const getDirectedMovies = await db.all(getDirectedMoviesQuery);
  response.send(
    getDirectedMovies.map((eachMovie) => gettingAllMoviesNames(eachMovie))
  );
});

module.exports = app;
