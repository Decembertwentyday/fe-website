import EthscriptionsService from './ethscriptions';
import MarketplaceService from './marketpalce';
import LaunchpadService from './launchpad';
import DidService from './did';
import DomainService from './domain';
import VaultService from './vault';
import FacetService from './facet';
import etchClient from './network/etchClient';
import facetClient from './network/facetClient';

class Services {
  ethscriptions: EthscriptionsService;
  marketplace: MarketplaceService;
  launchpad: LaunchpadService;
  vault: VaultService;
  did: DidService;
  domain: DomainService;
  facet: FacetService;
  constructor() {
    this.ethscriptions = new EthscriptionsService(etchClient);
    this.marketplace = new MarketplaceService(etchClient);
    this.launchpad = new LaunchpadService(etchClient);
    this.vault = new VaultService(etchClient);
    this.did = new DidService(etchClient);
    this.domain = new DomainService(etchClient);
    this.facet = new FacetService(facetClient);
  }
}

export default new Services();

export * as evmService from './evm';
