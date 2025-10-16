import { gql } from '@apollo/client';

export const SEARCH_ANIME = gql`
  query SearchAnime($query: String!, $source: APISource!) {
    searchAnime(query: $query, source: $source) {
      id
      title
      image
      synopsis
      episodes
      score
      year
      status
    }
  }
`;

export const GET_ANIME_CHARACTERS = gql`
  query GetAnimeCharacters($animeId: Int!, $source: APISource!) {
    getAnimeCharacters(animeId: $animeId, source: $source) {
      malId
      name
      image
    }
  }
`;

export const GET_ANIME_EPISODES = gql`
  query GetAnimeEpisodes($animeId: Int!, $source: APISource!) {
    getAnimeEpisodes(animeId: $animeId, source: $source) {
      number
      title
      aired
      duration
    }
  }
`;

export const GET_THEMES = gql`
  query GetThemes {
    themes {
      id
      name
      description
      color
    }
  }
`;

export const GET_EXTRACTS = gql`
  query GetExtracts($themeId: ID, $animeId: Int) {
    extracts(themeId: $themeId, animeId: $animeId) {
      id
      text
      characters {
        malId
        name
        image
      }
      animeId
      animeTitle
      animeImage
      timing {
        start
        end
      }
      season
      episode
      theme {
        id
        name
        color
      }
      createdAt
    }
  }
`;
