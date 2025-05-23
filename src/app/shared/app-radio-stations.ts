import { RadioStation } from './app-radio.model';

// ========== Single radio stations ==========

const RADIO_STATION_NDR1 : RadioStation = {
  id:          'ndr1',
  displayName: 'NDR 1',
  url:         'http://icecast.ndr.de/ndr/ndr1niedersachsen/hannover/mp3/128/stream.mp3',
  color:       '#FFC0C0',
};

const RADIO_STATION_80S_80S : RadioStation = {
  id:          's80s80s',
  displayName: '80s 80s',
  url:         'https://streams.80s80s.de/web/mp3-192/homepage/?context=fHA6LTE%3D&aw_0_1st.skey=1672079069&cb=800649150&aw_0_1st.playerid=80s80s_web&aw_0_req.userConsentV2=CPkmOgAPkmOgAAFADCDECwCgAAAAAEPAAAYgAAAR7AJMNW4gC7MscGbQMIoEQIwrCQigUAEFAMLRAQAODgp2VgE-sIEACAUARgRAhwBRgQCAAASAJCIAJAiwQAAAiAQAAgAQAIQAMDAILACwMAgABANAxRCgAECQAyICIpTAgKgSCAlsqEEoKpDTCAKssAKARGwUACIJARSAAICwcAwRICViwQJMUb5ACMEKAUSoQBA0AGAAII9iIAMAAQR7FQAYAAgj2MgAwABBHsAA.YAAAAAAAAAAA&listenerid=78db33aaa319436b9b1c63cc1c4c527c',
  color:       '#FFFFC0',
};

const RADIO_STATION_NDR2 : RadioStation = {
  id:          'ndr2',
  displayName: 'NDR 2',
  url:         'http://icecast.ndr.de/ndr/ndr2/niedersachsen/mp3/128/stream.mp3',
  color:       '#C0FFC0',
};

const RADIO_STATION_NDR_KULTUR : RadioStation = {
  id:          'ndr_kultur',
  displayName: 'NDR Kultur',
  url:         'http://icecast.ndr.de/ndr/ndrkultur/live/mp3/128/stream.mp3',
  color:       '#C0C0C0',
};

const RADIO_STATION_NDR_INFO : RadioStation = {
  id:          'ndrinfo',
  displayName: 'NDR Info',
  url:         'http://icecast.ndr.de/ndr/ndrinfo/niedersachsen/mp3/128/stream.mp3',
  color:       '#C0C0FF',
};

const RADIO_STATION_NJOY : RadioStation = {
  id:          'njoy',
  displayName: 'N-Joy',
  url:         'http://icecast.ndr.de/ndr/njoy/live/mp3/128/stream.mp3',
  color:       '#FFA080',
};

const RADIO_STATION_DEUTSCHLANDFUNK_KULTUR : RadioStation = {
  id:          'deutschlandfunk_kultur',
  displayName: 'DF Kultur',
  url:         'https://st02.sslstream.dlf.de/dlf/02/128/mp3/stream.mp3?aggregator=web',
  color:       '#FFC0C0',
};

const RADIO_STATION_RTL_ITM : RadioStation = {
  id:          'rtl_itm',
  displayName: '89.0 RTL',
  url:         'https://stream.89.0rtl.de/mix/mp3-256/radioplayerHP/?=&&___cb=982984999671737',
  color:       '#C0FFC0',
};

// ========== Radio station collections ==========

export const RADIO_STATIONS1 : RadioStation[] = [
  RADIO_STATION_NDR1,
  RADIO_STATION_80S_80S,
  RADIO_STATION_NDR2,
  RADIO_STATION_NDR_KULTUR,
  RADIO_STATION_NDR_INFO,
  RADIO_STATION_NJOY,
];

export const RADIO_STATIONS2 : RadioStation[] = [
  RADIO_STATION_DEUTSCHLANDFUNK_KULTUR,
  RADIO_STATION_80S_80S,
  RADIO_STATION_RTL_ITM,
  RADIO_STATION_NDR_KULTUR,
  RADIO_STATION_NDR_INFO,
  RADIO_STATION_NJOY,
];
