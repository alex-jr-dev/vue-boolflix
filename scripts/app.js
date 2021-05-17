// TODO: 1 - Creare un layout base con una searchbar (una input e un button) in cui possiamo scrivere completamente o parzialmente il nome di un film. Possiamo, cliccando il bottone, cercare sull’API tutti i film che contengono ciò che ha scritto l’utente. Vogliamo dopo la risposta dell’API visualizzare a schermo i seguenti valori per ogni film trovato:
// 1. Titolo
// 2. Titolo Originale
// 3. Lingua
// 4. Voto -> DONE

// 2 - Trasformiamo la stringa statica della lingua in una vera e propria bandiera della nazione corrispondente, gestendo il caso in cui non abbiamo la bandiera della nazione ritornata dall’API (le flag non ci sono in FontAwesome). -> DONE
// - Allarghiamo poi la ricerca anche alle serie tv. Con la stessa azione di ricerca dovremo prendere sia i film che corrispondono alla query, sia le serie tv, stando attenti ad avere alla fine dei valori simili (le serie e i film hanno campi nel JSON di risposta diversi, simili ma non sempre identici) -> DONE

// 3 - In questa milestone come prima cosa aggiungiamo la copertina del film o della serie al nostro elenco. Ci viene passata dall’API solo la parte finale dell’URL, questo perché poi potremo generare da quella porzione di URL tante dimensioni diverse. Dovremo prendere quindi l’URL base delle immagini di TMDB: https://image.tmdb.org/t/p/ per poi aggiungere la dimensione che vogliamo generare (troviamo tutte le dimensioni possibili a questo link: https://www.themoviedb.org/talk/53c11d4ec3a3684cf4006400) per poi aggiungere la parte finale dell’URL passata dall’API.
// Esempio di URL:
// https://image.tmdb.org/t/p/w342/wwemzKWzjKYJFfCeiB57q3r4Bcm.png -> DONE
// - Trasformiamo poi il voto da 1 a 10 decimale in un numero intero da 1 a 5, così da permetterci di stampare a schermo un numero di stelle piene che vanno da 1 a 5, lasciando le restanti vuote (troviamo le icone in FontAwesome).
// Arrotondiamo sempre per eccesso all’unità successiva, non gestiamo icone mezze piene (o mezze vuote :P) -> DONE

// 5 - Partendo da un film o da una serie, richiedere all'API quali sono gli attori che fanno parte del cast aggiungendo alla nostra scheda Film / Serie SOLO i primi 5 restituiti dall’API con Nome e Cognome, e i generi associati al film con questo schema: “Genere 1, Genere 2, ...”. -> DONE

// 6 - Creare una lista di generi richiedendo quelli disponibili all'API e creare dei filtri con i generi tv e movie per mostrare/nascondere le schede ottenute con la ricerca. -> DONE

new Vue({
  el: "#app",
  data: {
    flags: {
      en: "us",
    },
    tmdbKey: "e380019cdd166485d52e54e8f1d2dc20",
    userInput: "",
    moviesList: [],
    tvSeriesList: [],
    movieGenres: [],
    tvGenres: [],
    genreFilter: "",
    recentlyViewed: [],
    preferList: [],
    coverNull: "img/nocover.png",
  },

  mounted() {
    this.loadGenres("movie");
    this.loadGenres("tv");
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
              tvShow.isSeries = true;

              return tvShow;
            });
          }
        });
    },

    doSearch() {
      this.makeAxiosSearch("movie");
      this.makeAxiosSearch("tv");
    },
    callCast(movie) {
      if (movie.castList) {
        return;
      }
      const axiosOptions = {
        params: {
          api_key: this.tmdbKey,
          language: "it-IT",
        },
      };

      const type = movie.isSeries ? "tv" : "movie";

      axios
        .get(
          `https://api.themoviedb.org/3/${type}/${movie.id}/credits`,
          axiosOptions
        )
        .then((resp) => {
          this.$set(
            movie,
            "castList",
            resp.data.cast.slice(0, 5).map((item) => item.original_name)
          );
        });
    },
    loadGenres(type) {
      const axiosOptions = {
        params: {
          api_key: this.tmdbKey,
          language: "it-IT",
        },
      };

      axios
        .get(`https://api.themoviedb.org/3/genre/${type}/list`, axiosOptions)
        .then((resp) => {
          if (type === "movie") {
            this.movieGenres = resp.data.genres;
          } else {
            this.tvGenres = resp.data.genres;
          }
        });
    },
    // FIXME:
    onClickPref(currentMovie) {
      currentMovie.active = !currentMovie.active;
      if (this.preferList.includes(currentMovie)) {
        return;
      }
      this.preferList.push(currentMovie);
    },
  },
  computed: {
    fullList() {
      return this.moviesList
        .concat(this.tvSeriesList)
        .map((item) => {
          let poster = false;
          if (item.poster_path) {
            poster = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
          } else {
            poster = this.coverNull;
          }
          (item.country =
            this.flags[item.original_language] || item.original_language),
            (item.poster = poster),
            (item.vote = Math.round(item.vote_average / 2)),
            (item.active = false),
            (item.typeGenres = item.genre_ids.map((id) => {
              const genres = item.isSeries ? this.tvGenres : this.movieGenres;
              return genres.find((genre) => genre.id === id).name;
            }));
          return item;
        })
        .filter((item) => {
          if (!this.genreFilter) {
            return true;
          }
          return item.genre_ids.includes(this.genreFilter);
        });
    },
    allGenres() {
      return [...this.movieGenres, ...this.tvGenres]
        .filter((genre, index, self) => {
          return index === self.findIndex((i) => i.id === genre.id);
        })
        .sort((a, b) => {
          if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return -1;
          }
          if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return 1;
          }
          return 0;
        });
    },
  },
});
