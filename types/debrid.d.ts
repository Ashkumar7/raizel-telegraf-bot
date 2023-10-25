declare global {
  enum LOCALES {
    FRANCE = "fr",
    ENGLISH = "en",
    SPANISH = "es",
    ITALIAN = "it",
    DEUTSCH = "de",
    ARABIC = "ar",
    PORTUGUESE = "pt",
    PORTUGUESE_BRAZIL = "ptb",
    TURKISH = "tr",
    DUTCH = "nl",
    PERSIAN_FARSI = "ir",
    TRADITIONAL_CHINESE = "cts",
    SIMPLIFIED_CHINESE = "cns",
    POLISH = "pl",
    INDONESIAN = "id",
    CROATIAN = "hr",
    RUSSIAN = "ru",
    ROMANIAN = "ro",
  }

  /**
   * Represents user information.
   * @interface {Object} UserInterface
   * @property {number} id - The unique identifier for the user.
   * @property {string} username - The username of the user.
   * @property {string} email - The email address of the user.
   * @property {number} points - The fidelity points of the user.
   * @property {LOCALES} locale - The user's preferred language.
   * @property {string} avatar - The URL to the user's avatar.
   * @property {'premium' | 'free'} type - The user's type, which can be "premium" or "free".
   * @property {number} premium - The number of seconds left as a Premium user.
   * @property {string} expiration - The date when the user's Premium status expires in JSON format.
   */
  interface UserInterface {
    id: number;
    username: string;
    email: string;
    points: number;
    locale: LOCALES;
    avatar: string;
    type: "premium" | "free";
    premium: number;
    expiration: string;
  }

  /**
   * Get traffic information for limited hosters (DDL, Scribd, Uloz, remote)
   */
  type LimitedHostersTrafficType = {
    [K in DDownload | Scribd | Uloz]: {
      left: number;
      bytes: number;
      links: number;
      limit: number;
      type: "links" | "bytes" | "gigabytes";
      extra: number;
      reset: "daily" | "weekly" | "monthly";
    };
  } & {
    remote: {
      left: number;
      type: "links" | "bytes" | "gigabytes";
    };
  };

  /**
   * Retrieves data within a specified time range.
   *
   * @param {string} start - The start date (YYYY-MM-DD) for the query.
   *                           Defaulted: One week ago from the current date.
   * @param {string} end - The end date (YYYY-MM-DD) for the query.
   *                         Default: Today's date.
   * @returns {Promise<any>} - A promise that resolves with the query results.
   *
   * @example
   */
  interface TrafficByDateAndHostInterface {
    [key: string]: {
      host: {
        [K in Hosters]: number;
      };
      bytes: number;
    };
  }

  /**
   * Get transcoding links for given file ID.
   */
  type TranscodeLinkType = {
    [key in "apple" | "dash" | "liveMP4" | "h264WebM"]: {
      full: string;
    };
  };

  /**
   * Represents information about media content.
   * @interface MediaInfoInterface
   * @property {string} filename - The cleaned filename.
   * @property {string} hoster - The file hosted on.
   * @property {string} link - The original content link.
   * @property {'movie' | 'show' | 'audio'} type - The type of media content.
   * @property {string | null} season - The season of the content if found, or null if not available.
   * @property {string | null} episode - The episode of the content if found, or null if not available.
   * @property {number | null} year - The year of the content if found, or null if not available.
   * @property {number} duration - The media duration in seconds.
   * @property {number} bitrate - The bitrate of the media file.
   * @property {number} size - The original filesize in bytes.
   * @property {Object} details - Details about the media content.
   * @property {Object.<string, {
   *   stream: string;
   *   lang: string;
   *   lang_iso: string;
   *   codec: string;
   *   colorspace: string;
   *   width: number;
   *   height: number;
   * }>} details.video - Video-related details.
   * @property {Object.<string, {
   *   stream: string;
   *   lang: string;
   *   lang_iso: string;
   *   codec: string;
   *   sampling: number;
   *   channels: number;
   * }>} details.audio - Audio-related details.
   * @property {(Object.<string, {
   *   stream: string;
   *   lang: string;
   *   lang_iso: string;
   *   type: string;
   * }> | [])} details.subtitles - Subtitles-related details or an empty array if not available.
   * @property {string | undefined} poster_path - The URL of the poster image if found/available.
   * @property {string | undefined} backdrop_path - The URL of the backdrop image if found/available.
   * @property {string | undefined} baseUrl - The base URL if available.
   * @property {Object} availableFormats - Available media formats.
   * @property {string} availableFormats.apple - Apple media format ('m3u8').
   * @property {string} availableFormats.dash - Dash media format ('mpd').
   * @property {string} availableFormats.liveMP4 - Live MP4 media format ('mp4').
   * @property {string} availableFormats.h264WebM - H.264 WebM media format ('webm').
   * @property {Object.<string, string>} availableQualities - Available media qualities.
   * @property {string} modelUrl - The URL of the media model.
   * @property {string} host - The host of the media content.
   */
  interface MediaInfoInterface {
    filename: string;
    hoster: string;
    link: string;
    type: "movie" | "show" | "audio";
    season: string | null;
    episode: string | null;
    year: number | null;
    duration: number;
    bitrate: number;
    size: number;
    details: {
      video: {
        [key: string]: {
          stream: string;
          lang: string;
          lang_iso: string;
          codec: string;
          colorspace: string;
          width: number;
          height: number;
        };
      };
      audio: {
        [key: string]: {
          stream: string;
          lang: string;
          lang_iso: string;
          codec: string;
          sampling: number;
          channels: number;
        };
      };
      subtitles:
        | {
            [key: string]: {
              stream: string;
              lang: string;
              lang_iso: string;
              type: string;
            };
          }
        | [];
    };
    poster_path?: string;
    backdrop_path?: string;
    baseUrl?: string;
    availableFormats: {
      apple: "m3u8";
      dash: "mpd";
      liveMP4: "mp4";
      h264WebM: "webm";
    };
    availableQualities: {
      [key: string]: string;
    };
    modelUrl: string;
    host: string;
  }

  /**
   * Represents a download information object.
   * @interface {Object} DownloadedInterface
   * @property {string} id - The unique identifier for the download.
   * @property {string} filename - The name of the downloaded file.
   * @property {string} mimeType - The MIME type of the downloaded file.
   * @property {number} filesize - The size of the downloaded file in bytes. If unknown, it is set to 0.
   * @property {string} link - The original link to the file.
   * @property {Hosters} host - Information about the hosting server.
   * @property {string} host_icon - The icon associated with the hosting server.
   * @property {number} chunks - The maximum number of chunks allowed for the download.
   * @property {string} download - The generated download link for the file.
   * @property {1 | 0} streamable - Indicates whether the file is streamable (1) or not (0).
   * @property {string} generated - The date when the download information was generated in JSON format.
   */
  interface DownloadedInterface {
    id: string;
    filename: string;
    mimeType: string;
    filesize: number;
    link: string;
    host: Hosters;
    host_icon: string;
    chunks: number;
    download: string;
    streamable: 1 | 0;
    generated: string;
  }

  /**
   * Represents a torrent information object.
   * @interface {Object} TorrentInterface
   * @property {string} id - The unique identifier for the torrent.
   * @property {string} filename - The name of the torrent file.
   * @property {string} hash - The SHA1 hash of the torrent.
   * @property {number} bytes - The size of selected files in the torrent in bytes.
   * @property {number} original_bytes - The size of the torrent in bytes.
   * @property {Hosters} host - The main domain of the hosting server.
   * @property {number} split - The split size of links.
   * @property {number} progress - The progress of the torrent, with possible values from 0 to 100.
   * @property {string} status - The current status of the torrent, which can be one of the following:
   *                            - "magnet_error"
   *                            - "magnet_conversion"
   *                            - "waiting_files_selection"
   *                            - "queued"
   *                            - "downloading"
   *                            - "downloaded"
   *                            - "error"
   *                            - "virus"
   *                            - "compressing"
   *                            - "uploading"
   *                            - "dead"
   * @property {string} added - The date when the torrent information was added in JSON format.
   * @property {string[]} links - An array of host URLs associated with the torrent.
   * @property {string} ended - The date when the torrent has ended, only present when finished, in JSON format.
   * @property {number} speed - The speed of the torrent, only present in "downloading," "compressing," or "uploading" status.
   * @property {number} seeders - The number of seeders, only present in "downloading" or "magnet_conversion" status.
   */
  interface TorrentInterface {
    id: string;
    filename: string;
    hash: string;
    bytes: number;
    original_bytes?: number;
    host: Hosters;
    split: number;
    progress: number;
    status:
      | "magnet_error"
      | "magnet_conversion"
      | "waiting_files_selection"
      | "queued"
      | "downloading"
      | "downloaded"
      | "error"
      | "virus"
      | "compressing"
      | "uploading"
      | "dead";
    added: string;
    links: string[];
    ended: string;
    speed?: number;
    seeders?: number;
  }

  /**
   * Represents detailed information about a torrent by its unique identifier.
   * @interface TorrentByIdInterface
   * @extends {Torrent} - Extends the base Torrent interface.
   */
  interface TorrentByIdInterface extends TorrentInterface {
    /**
     * An array of files associated with the torrent.
     * @property {number} id - The unique identifier for the file.
     * @property {string} path - The path to the file.
     * @property {string} bytes - The size of the file in bytes.
     * @property {1 | 0} selected - Indicates whether the file is selected (1) or not (0).
     */
    files: {
      id: number;
      path: string;
      bytes: string;
      selected: 1 | 0;
    };
  }

  /**
   * Get a list of instantly available file IDs by hoster, {hash} is the SHA1 of the torrent.
   */
  interface TorrentInstantAvailabilityInterface {
    [key: string]: {
      rd: Array<{
        [key: string]: {
          filename: string;
          filesize: number;
        };
      }>;
    };
  }

  /**
   * Represents information about active torrents and torrent limits.
   * @interface {Object} ActiveTorrentInterface
   * @property {number} nb - The number of currently active torrents.
   * @property {number} limit - The maximum number of active torrents you can have.
   */
  interface ActiveTorrentInterface {
    nb: number;
    limit: number;
  }

  /**
   * Represents available hosts to upload the torrent to.
   * @interface {Object} AvailableHostForTorrentInterface
   * @property {string} host - The main domain of the hosting service.
   * @property {number} max_file_size - The maximum split size possible for files.
   */
  interface AvailableHostForTorrentInterface {
    host: Hosters;
    max_file_size: number;
  }

  /**
   * Represents response returned after adding a magnet link.
   * @interface {Object} AddMagnetInterface
   * @property {string} id - The unique identifier for the torrent.
   * @property {string} uri - URL of the created resource.
   */

  interface AddMagnetInterface {
    id: string;
    uri: string;
  }

  /**
   * Get supported hosts.
   */
  interface Hosts {
    [key: string]: {
      id: string;
      name: string;
      image: string;
      image_big: string;
    };
  }

  // Generate Typedoc
  /**
   * Represents information about a hoster's status.
   * @interface {Object} HostStatus
   * @property {string} id - The unique identifier for the hoster.
   * @property {string} name - The name of the hoster.
   * @property {string} image - The URL to the hoster's icon.
   * @property {1 | 0} supported - Indicates whether the hoster is supported (1) or not (0).
   * @property {'up' | 'down' | 'unsupported'} status - The status of the hoster, which can be one of the following:
   *                                                  - "up"
   *                                                  - "down"
   *                                                  - "unsupported"
   *
   * @property {string} check_time - The date when the hoster's status was last checked in JSON format.
   * @property {Object.<string, {
   *  status: 'up' | 'down' | 'unsupported';
   *  check_time: string;
   *  }>} competitors_status - Competitor status information.
   *
   */

  type HostStatus = {
    [K in Hosters]: {
      id: string;
      name: string;
      image: string;
      supported: 1 | 0;
      status: "up" | "down" | "unsupported";
      check_time: string;
      competitors_status: CompetitorHostStatus;
    };
  };

  /**
   * Represents information about a competitor's status.
   *
   * @interface {Object} CompetitorInfo
   * @property {string} status - The status of the competitor's domain ("up", "down", or "unsupported").
   * @property {string} check_time - The date in JSON format when the competitor's status was last checked.
   */
  interface CompetitorHostStatus {
    [key: string]: {
      status: "up" | "down" | "unsupported";
      check_time: string;
    };
  }

  /**
   * supported links Regex, useful to find supported links inside a document.
   */
  type HostsRegex = Array<String>;

  /**
   * all supported folders Regex, useful to find supported links inside a document.
   */
  type HostsRegexFolder = Array<String>;

  /**
   * all hoster domains supported on the service.
   */
  type HostsDomains = Array<String>;

  /**
   * Represents user settings for download ports, locales, streaming qualities, and preferences.
   *
   * @interface {Object} UserSettings
   * @property {string[]} download_ports - Possible "download_port" values for updating settings.
   * @property {string} download_port - Current user download port.
   * @property {Object.<string, string>} locales - Possible "locale" values for updating settings.
   * @property {string} locale - Current user locale.
   * @property {string[]} streaming_qualities - Possible "streaming_quality" values for updating settings.
   * @property {string} streaming_quality - Current user streaming quality.
   * @property {string} mobile_streaming_quality - Current user streaming quality on mobile devices.
   * @property {Object.<string, string>} streaming_languages - Possible "streaming_language_preference" values for updating settings.
   * @property {string} streaming_language_preference - Current user streaming language preference.
   * @property {string[]} streaming_cast_audio - Possible "streaming_cast_audio_preference" values for updating settings.
   * @property {string} streaming_cast_audio_preference - Current user audio preference on Google Cast devices.
   */
  interface UserSettings {
    download_ports: ["normal", "secured"];
    download_port: "normal" | "secured";
    locales: {
      [key in LOCALES]: string;
    };
    locale: LOCALES;
    streaming_qualities: ["original", "high", "medium", "low"];
    streaming_quality: "original" | "high" | "medium" | "low";
    mobile_streaming_quality: "original" | "high" | "medium" | "low";
    streaming_languages: {
      fre: "Français";
      eng: "English";
      ita: "Italiano";
      esp: "Español";
    };
    streaming_language_preference: "fre" | "eng" | "ita" | "esp";
    streaming_cast_audio: ["aac", "dolby"];
    streaming_cast_audio_preference: "aac" | "dolby";
  }

  type ErrorMessages =
    | "Internal error"
    | "Missing parameter"
    | "Bad parameter value"
    | "Unknown method"
    | "Method not allowed"
    | "Slow down"
    | "Resource unreachable"
    | "Resource not found"
    | "Bad token"
    | "Permission denied"
    | "Two-Factor authentication needed"
    | "Two-Factor authentication pending"
    | "Invalid login"
    | "Invalid password"
    | "Account locked"
    | "Account not activated"
    | "Unsupported hoster"
    | "Hoster in maintenance"
    | "Hoster limit reached"
    | "Hoster temporarily unavailable"
    | "Hoster not available for free users"
    | "Too many active downloads"
    | "IP Address not allowed"
    | "Traffic exhausted"
    | "File unavailable"
    | "Service unavailable"
    | "Upload too big"
    | "Upload error"
    | "File not allowed"
    | "Torrent too big"
    | "Torrent file invalid"
    | "Action already done"
    | "Image resolution error"
    | "Torrent already active"
    | "Too many requests"
    | "Infringing file"
    | "Fair Usage Limit";

  interface DebridError {
    error: ErrorMessages;
    error_code: number;
  }
}

export {};
