import { gql } from '@apollo/client';

export const CREATE_EXTRACT = gql`
  mutation CreateExtract($input: CreateExtractInput!) {
    createExtract(input: $input) {
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

export const CREATE_THEME = gql`
  mutation CreateTheme($input: CreateThemeInput!) {
    createTheme(input: $input) {
      id
      name
      description
      color
    }
  }
`;

export const UPDATE_EXTRACT = gql`
  mutation UpdateExtract($id: ID!, $input: UpdateExtractInput!) {
    updateExtract(id: $id, input: $input) {
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
    }
  }
`;

export const DELETE_EXTRACT = gql`
  mutation DeleteExtract($id: ID!) {
    deleteExtract(id: $id)
  }
`;

export const UPDATE_THEME = gql`
  mutation UpdateTheme($id: ID!, $input: UpdateThemeInput!) {
    updateTheme(id: $id, input: $input) {
      id
      name
      description
      color
    }
  }
`;

export const DELETE_THEME = gql`
  mutation DeleteTheme($id: ID!) {
    deleteTheme(id: $id)
  }
`;

export const CREATE_THEME_GROUP = gql`
  mutation CreateThemeGroup($input: CreateThemeGroupInput!) {
    createThemeGroup(input: $input) {
      id
      name
      description
      color
      themes {
        id
        name
        color
      }
      extractCount
    }
  }
`;

export const UPDATE_THEME_GROUP = gql`
  mutation UpdateThemeGroup($id: ID!, $input: UpdateThemeGroupInput!) {
    updateThemeGroup(id: $id, input: $input) {
      id
      name
      description
      color
      themes {
        id
        name
        color
      }
      extractCount
    }
  }
`;

export const DELETE_THEME_GROUP = gql`
  mutation DeleteThemeGroup($id: ID!) {
    deleteThemeGroup(id: $id)
  }
`;

export const UPDATE_SETTINGS = gql`
  mutation UpdateSettings($youtubeChannelUrl: String) {
    updateSettings(youtubeChannelUrl: $youtubeChannelUrl) {
      id
      youtubeChannelUrl
      updatedAt
      updatedBy
    }
  }
`;

export const UPDATE_YOUTUBE_CHANNEL_URL = gql`
  mutation UpdateYouTubeChannelUrl($url: String!) {
    updateYouTubeChannelUrl(url: $url) {
      id
      youtubeChannelUrl
    }
  }
`;

export const CREATE_VIDEO = gql`
  mutation CreateVideo($input: CreateVideoInput!) {
    createVideo(input: $input) {
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

export const UPDATE_VIDEO = gql`
  mutation UpdateVideo($id: ID!, $input: UpdateVideoInput!) {
    updateVideo(id: $id, input: $input) {
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
      updatedAt
    }
  }
`;

export const DELETE_VIDEO = gql`
  mutation DeleteVideo($id: ID!) {
    deleteVideo(id: $id)
  }
`;

export const PUBLISH_VIDEO = gql`
  mutation PublishVideo($id: ID!, $youtubeVideoId: String!) {
    publishVideo(id: $id, youtubeVideoId: $youtubeVideoId) {
      id
      isPublished
      youtubeVideoId
      updatedAt
    }
  }
`;

export const LINK_PUBLISHED_VIDEO = gql`
  mutation LinkPublishedVideo($input: LinkPublishedVideoInput!) {
    linkPublishedVideo(input: $input) {
      id
      youtubeVideoId
      title
      description
      thumbnail
      publishedAt
      duration
      viewCount
      likeCount
      commentCount
      extractIds
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PUBLISHED_VIDEO = gql`
  mutation UpdatePublishedVideo($id: ID!, $extractIds: [ID!]!) {
    updatePublishedVideo(id: $id, extractIds: $extractIds) {
      id
      youtubeVideoId
      title
      extractIds
      updatedAt
    }
  }
`;

export const DELETE_PUBLISHED_VIDEO = gql`
  mutation DeletePublishedVideo($id: ID!) {
    deletePublishedVideo(id: $id)
  }
`;

export const CORRECT_SPELLING = gql`
  mutation CorrectSpelling($text: String!) {
    correctSpelling(text: $text)
  }
`;

export const TRANSLATE_TEXT = gql`
  mutation TranslateText($text: String!) {
    translateText(text: $text)
  }
`;
