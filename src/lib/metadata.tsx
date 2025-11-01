'use client';
import { ReactNode, createContext, useContext, useState, useCallback, useEffect } from 'react';

type OpenGraphType = 'article' | 'book' | 'music' | 'video' | 'website' | 'profile';

interface ClientMetadata {
  // Basic Metadata
  title?: string;
  description?: string;
  applicationName?: string;
  authors?: { name: string; url?: string }[];
  generator?: string;
  keywords?: string[];
  referrer?: 'no-referrer' | 'origin' | 'no-referrer-when-downgrade' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  themeColor?: string;
  colorScheme?: 'normal' | 'dark' | 'light';
  viewport?: string;
  creator?: string;
  publisher?: string;
  robots?: string;

  // Open Graph
  openGraph?: {
    type?: OpenGraphType;
    title?: string;
    description?: string;
    url?: string;
    siteName?: string;
    locale?: string;
    alternateLocale?: string[];
    images?: {
      url: string;
      alt?: string;
      width?: number;
      height?: number;
      secureUrl?: string;
      type?: string;
    }[];
    audio?: {
      url: string;
      secureUrl?: string;
      type?: string;
    }[];
    videos?: {
      url: string;
      secureUrl?: string;
      type?: string;
      width?: number;
      height?: number;
    }[];
    determiner?: string;
  } | null;

  // Twitter
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    image?: string;
    images?: { url: string; alt?: string }[];
  } | null;

  // Alternative URLs
  alternates?: {
    canonical?: string;
    languages?: Record<string, string>;
    media?: Record<string, string>;
    types?: Record<string, string>;
  } | null;

  // App Links
  appLinks?: {
    ios?: {
      url: string;
      app_store_id?: string;
    }[];
    android?: {
      package: string;
      url: string;
    }[];
    web?: {
      url: string;
      should_fallback?: boolean;
    }[];
  } | null;

  // Archives and Assets
  archives?: string[] | null;
  assets?: string[] | null;
  bookmarks?: string[] | null;

  // Verification
  verification?: {
    google?: string | null;
    yandex?: string | null;
    yahoo?: string | null;
    other?: Record<string, string>;
  } | null;
}

type MetadataContextType = {
  metadata: ClientMetadata;
  setMetadata: (metadata: ClientMetadata) => void;
  updateMetadata: (partial: Partial<ClientMetadata>) => void;
};

const defaultMetadata: ClientMetadata = {
  title: 'Graphite',
};

const MetadataContext = createContext<MetadataContextType | undefined>(undefined);

export function MetadataProvider({ children }: { children: React.ReactNode }) {
  const [metadata, setMetadata] = useState<ClientMetadata>(defaultMetadata);

  // Stable functions to avoid unnecessary re-renders
  const stableSetMetadata = useCallback((metadata: ClientMetadata) => setMetadata(metadata), []);
  const updateMetadata = useCallback(
    (partial: Partial<ClientMetadata>) => setMetadata(prev => ({ ...prev, ...partial })),
    []
  );

  // Get initial server-rendered metadata
  useEffect(() => {
    // Helper function to safely get meta content
    const getMetaContent = (selector: string): string | undefined => {
      const element = document.querySelector(selector);
      if (!(element instanceof HTMLMetaElement)) return undefined;
      const content = element.getAttribute('content');
      return typeof content === 'string' ? content : undefined;
    };

    const getLinkHref = (selector: string): string | undefined => {
      const element = document.querySelector(selector);
      if (!(element instanceof HTMLLinkElement)) return undefined;
      const href = element.getAttribute('href');
      return typeof href === 'string' ? href : undefined;
    };

    // Helper to safely merge with defaults
    const mergeWithDefault = <T>(value: T | undefined, defaultValue: T | undefined): T | undefined => {
      return typeof value !== 'undefined' ? value : defaultValue;
    };

    // Basic metadata
    const title = mergeWithDefault(document.title || undefined, defaultMetadata.title);
    const description = mergeWithDefault(getMetaContent("meta[name='description']"), defaultMetadata.description);
    const keywordsContent = getMetaContent("meta[name='keywords']");
    const keywords = typeof keywordsContent === 'string' ? keywordsContent.split(',').map(k => k.trim()) : defaultMetadata.keywords;
    const themeColor = mergeWithDefault(getMetaContent("meta[name='theme-color']"), defaultMetadata.themeColor);
    const viewport = mergeWithDefault(getMetaContent("meta[name='viewport']"), defaultMetadata.viewport);
    
    // OpenGraph
    const defaultOG = defaultMetadata.openGraph || {};
    const ogTitle = mergeWithDefault(getMetaContent("meta[property='og:title']"), defaultOG.title);
    const ogDescription = mergeWithDefault(getMetaContent("meta[property='og:description']"), defaultOG.description);
    const ogTypeContent = getMetaContent("meta[property='og:type']");
    const ogType = mergeWithDefault(ogTypeContent as OpenGraphType | undefined, defaultOG.type);
    const ogUrl = mergeWithDefault(getMetaContent("meta[property='og:url']"), defaultOG.url);
    const ogSiteName = mergeWithDefault(getMetaContent("meta[property='og:site_name']"), defaultOG.siteName);
    
    // Twitter
    const defaultTwitter = defaultMetadata.twitter || {};
    const twitterCard = mergeWithDefault(
      getMetaContent("meta[name='twitter:card']") as ("summary" | "summary_large_image" | "app" | "player" | undefined),
      defaultTwitter.card
    );
    const twitterTitle = mergeWithDefault(getMetaContent("meta[name='twitter:title']"), defaultTwitter.title);
    const twitterDescription = mergeWithDefault(getMetaContent("meta[name='twitter:description']"), defaultTwitter.description);
    
    // Canonical
    const canonical = getLinkHref("link[rel='canonical']");

    setMetadata(prev => ({
      ...prev,
      title,
      description,
      keywords,
      themeColor,
      viewport,
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        type: ogType,
        url: ogUrl,
        siteName: ogSiteName,
      },
      twitter: {
        card: twitterCard as "summary" | "summary_large_image" | "app" | "player",
        title: twitterTitle,
        description: twitterDescription,
      },
      alternates: {
        canonical,
      },
    }));
  }, []);

  // Update metadata when it changes
  useEffect(() => {
    const updateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name='${name}']`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const updateOG = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property='og:${property}']`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', `og:${property}`);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const updateTwitter = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name='twitter:${name}']`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', `twitter:${name}`);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Helper to check if string exists and is not empty
    const isValidString = (str: string | undefined): str is string => 
      typeof str === 'string' && str.length > 0;

    // Update basic metadata
    if (isValidString(metadata.title)) {
      document.title = metadata.title;
    }
    
    if (isValidString(metadata.description)) {
      updateMeta('description', metadata.description);
    }
    
    if (metadata.keywords && metadata.keywords.length > 0) {
      updateMeta('keywords', metadata.keywords.join(', '));
    }
    
    if (isValidString(metadata.themeColor)) {
      updateMeta('theme-color', metadata.themeColor);
    }
    
    if (isValidString(metadata.viewport)) {
      updateMeta('viewport', metadata.viewport);
    }

    // Update OpenGraph
    if (metadata.openGraph) {
      const og = metadata.openGraph;
      if (isValidString(og.title)) updateOG('title', og.title);
      if (isValidString(og.description)) updateOG('description', og.description);
      if (isValidString(og.type)) updateOG('type', og.type);
      if (isValidString(og.url)) updateOG('url', og.url);
      if (isValidString(og.siteName)) updateOG('site_name', og.siteName);
    }

    // Update Twitter
    if (metadata.twitter) {
      const twitter = metadata.twitter;
      if (isValidString(twitter.card)) updateTwitter('card', twitter.card);
      if (isValidString(twitter.title)) updateTwitter('title', twitter.title);
      if (isValidString(twitter.description)) updateTwitter('description', twitter.description);
    }

    // Update canonical
    const canonical = metadata.alternates?.canonical;
    if (isValidString(canonical)) {
      let link = document.querySelector("link[rel='canonical']");
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }
  }, [metadata]);

  return <MetadataContext.Provider value={{ metadata, setMetadata: stableSetMetadata, updateMetadata }}>{children}</MetadataContext.Provider>;
}

export function useMetadata() {
  const ctx = useContext(MetadataContext);
  if (!ctx) throw new Error('useMetadata must be used inside MetadataProvider');
  return ctx;
}
