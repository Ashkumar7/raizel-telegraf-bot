import createAxiosInstance from '@lib/axiosInstance';

class DebridCommandsUtilis {
  /**
   * function to unrestrict a link
   * @param link string
   * @returns Promise<DownloadedInterface>
   */
  static unrestrictLink = async (link: string): Promise<DownloadedInterface> => {
    const { data } = await createAxiosInstance<DownloadedInterface>().request({
      method: 'post',
      url: '/rest/1.0/unrestrict/link',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: { link },
    });
    return data;
  };

  /**
   * add magnet link for magnet_conversion
   * @param magnet string
   * @returns Promise<AddMagnetInterface>
   */
  static addMagnet = async (magnet: string): Promise<AddMagnetInterface> => {
    const { data } = await createAxiosInstance<AddMagnetInterface>().request({
      method: 'post',
      url: '/rest/1.0/torrents/addMagnet',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: { magnet },
    });
    return data;
  };

  /**
   * get torrent info by id
   * @param id string
   * @returns Promise<TorrentInterface>
   */
  static torrentInfo = async (id: string): Promise<TorrentInterface> => {
    const { data } = await createAxiosInstance<TorrentInterface>().request({
      method: 'get',
      url: `/rest/1.0/torrents/info/${id}`,
    });
    return data;
  };

  /**
   * function to calculate ETA for a download
   * @param progress number
   * @param totalSizeInBytes number | undefined
   * @param speed number | undefined
   * @returns string
   */
  static calculateETA = (progress: number, totalSizeInBytes: number | undefined, speed: number | undefined) => {
    if (progress === 0) {
      return '-';
    }

    const completedSizeInBytes = (progress / 100) * totalSizeInBytes;
    const remainingSizeInBytes = totalSizeInBytes - completedSizeInBytes;
    const etaInSeconds = remainingSizeInBytes / speed;

    // Convert seconds to a more readable format
    const hours = Math.floor(etaInSeconds / 3600);
    const minutes = Math.floor((etaInSeconds % 3600) / 60);
    const seconds = Math.floor(etaInSeconds % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  /**
   * make a progress string bar
   * @param progess number
   * @returns string
   */
  static progressBar = (progess: number) => {
    const completedWidth = Math.round((progess / 100) * 15);
    const remainingWidth = 15 - completedWidth;
    return `[ ${'≗'.repeat(completedWidth)}${'─'.repeat(remainingWidth)} ] ${progess}%`;
  };
}

export default DebridCommandsUtilis;
