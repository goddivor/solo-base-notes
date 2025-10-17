import { gql } from '@apollo/client';

export const GET_SETTINGS = gql`
  query GetSettings {
    settings {
      id
      youtubeChannelUrl
      updatedAt
      updatedBy
    }
  }
`;

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

export const GET_EXTRACT = gql`
  query GetExtract($id: ID!) {
    extract(id: $id) {
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
      apiSource
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
    }
  }
`;

export const GET_YOUTUBE_CHANNEL_INFO = gql`
  query GetYouTubeChannelInfo($url: String!) {
    getYouTubeChannelInfo(url: $url) {
      id
      title
      description
      customUrl
      thumbnail
      subscriberCount
      videoCount
      viewCount
      bannerUrl
    }
  }
`;

export const GET_YOUTUBE_CHANNEL_VIDEOS = gql`
  query GetYouTubeChannelVideos($url: String!, $maxResults: Int) {
    getYouTubeChannelVideos(url: $url, maxResults: $maxResults) {
      id
      title
      description
      thumbnail
      publishedAt
      duration
      durationInSeconds
      isShort
      viewCount
      likeCount
      commentCount
    }
  }
`;

export const SEARCH_SPOTIFY_TRACKS = gql`
  query SearchSpotifyTracks($query: String!, $limit: Int) {
    searchSpotifyTracks(query: $query, limit: $limit) {
      id
      name
      artists {
        id
        name
      }
      album {
        id
        name
        image
      }
      duration
      previewUrl
      spotifyUrl
      uri
    }
  }
`;

export const GET_SPOTIFY_TRACK = gql`
  query GetSpotifyTrack($trackId: String!) {
    getSpotifyTrack(trackId: $trackId) {
      id
      name
      artists {
        id
        name
      }
      album {
        id
        name
        image
      }
      duration
      previewUrl
      spotifyUrl
      uri
    }
  }
`;

export const GET_VIDEOS = gql`
  query GetVideos($limit: Int, $offset: Int) {
    videos(limit: $limit, offset: $offset) {
      id
      title
      description
      tags
      segments {
        extractId
        text
        order
      }
      musicTracks {
        id
        name
        artists {
          id
          name
        }
        album {
          id
          name
          image
        }
        duration
        previewUrl
        spotifyUrl
        uri
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_VIDEO = gql`
  query GetVideo($id: ID!) {
    video(id: $id) {
      id
      title
      description
      tags
      segments {
        extractId
        text
        order
      }
      musicTracks {
        id
        name
        artists {
          id
          name
        }
        album {
          id
          name
          image
        }
        duration
        previewUrl
        spotifyUrl
        uri
      }
      createdAt
      updatedAt
    }
  }
`;
