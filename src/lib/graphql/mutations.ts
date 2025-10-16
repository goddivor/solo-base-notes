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
