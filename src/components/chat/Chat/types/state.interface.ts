export interface State {
  show: boolean;
  pricePerMessage: number;
  showPricePerMessage: boolean;
  loadingChat: boolean;
  appMode: boolean;
  tribeParams: {[k:string]:any};
  showPod: boolean;
  status: any;
  pod: any,
  podError: string
}