export interface Thumbnail {
  url: string;
  width?: number;
  height?: number;
}

export interface Thumbnails {
  default: Thumbnail;
  medium?: Thumbnail;
  high: Thumbnail;
}

export interface Snippet {
  title: string;
  description?: string;
  publishedAt: string;
  thumbnails: Thumbnails;
  resourceId: {
    channelId: string;
  };
}

export interface Statistics {
  subscriberCount?: string;
  videoCount?: string;
  viewCount?: string;
}

export interface BrandingSettings {
  image?: {
    bannerExternalUrl?: string;
  };
}

export interface Subscription {
  id: string;
  snippet: Snippet;
  statistics?: Statistics;
  brandingSettings?: BrandingSettings;
}

export interface ChannelDetails {
  id: string;
  snippet: Snippet & {
    description: string;
  };
  statistics: Required<Statistics>;
  brandingSettings: BrandingSettings;
}

export interface Channel {
  id: string;
  snippet: Snippet;
  [key: string]: unknown;
}
