// TODO: 1 - Creare un layout base con una searchbar (una input e un button) in cui possiamo scrivere completamente o parzialmente il nome di un film. Possiamo, cliccando il bottone, cercare sull’API tutti i film che contengono ciò che ha scritto l’utente. Vogliamo dopo la risposta dell’API visualizzare a schermo i seguenti valori per ogni film trovato:
// 1. Titolo
// 2. Titolo Originale
// 3. Lingua
// 4. Voto -> DONE

// 2 - Trasformiamo la stringa statica della lingua in una vera e propria bandiera della nazione corrispondente, gestendo il caso in cui non abbiamo la bandiera della nazione ritornata dall’API (le flag non ci sono in FontAwesome).
// - Allarghiamo poi la ricerca anche alle serie tv. Con la stessa azione di ricerca dovremo prendere sia i film che corrispondono alla query, sia le serie tv, stando attenti ad avere alla fine dei valori simili (le serie e i film hanno campi nel JSON di risposta diversi, simili ma non sempre identici) -> DONE

new Vue({
  el: "#app",
  data: {
    tmdbKey: "e380019cdd166485d52e54e8f1d2dc20",
    userInput: "",
    moviesList: [],
    tvSeriesList: [],
  },
  methods: {
    makeAxiosSearch(searchType) {
      const axiosOptions = {
        params: {
          api_key: this.tmdbKey,
          query: this.userInput,
          language: "it-IT",
        },
      };

      axios
        .get("https://api.themoviedb.org/3/search/" + searchType, axiosOptions)
        .then((resp) => {
          if (searchType === "movie") {
            this.moviesList = resp.data.results;
          } else if (searchType === "tv") {
            this.tvSeriesList = resp.data.results.map((tvShow) => {
              tvShow.original_title = tvShow.original_name;
              tvShow.title = tvShow.name;

              return tvShow;
            });
          }
        });
    },

    doSearch() {
      this.makeAxiosSearch("movie");
      this.makeAxiosSearch("tv");
    },
  },
});
