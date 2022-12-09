import { Component, OnInit } from '@angular/core';
import { configure, getMethods } from '@radixdlt/connect-button';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Angular with @radixdlt/connect-button';

  connectButton!: ReturnType<typeof configure>;

  ngOnInit(): void {
    this.connectButton = configure({
      dAppId: 'dashboard',
      networkId: 34,
      logLevel: 'DEBUG',
      onConnect: ({ setState, getWalletData }) => {
        getWalletData({
          oneTimeAccountsWithoutProofOfOwnership: {},
        }).map(({ oneTimeAccounts }) => {
          setState({ connected: true });
          return oneTimeAccounts[0].address;
        }).andThen(sendTx)
      },
      onDisconnect: ({ setState }) => {
        setState({ connected: false });
      },
      onCancel() {
        console.log('Cancel Clicked');
      },
      onDestroy() {
        console.log('Button Destroyed');
      },
    });

    const sendTx = (address: string) =>
      getMethods().sendTransaction({
        version: 1,
        transactionManifest: `
          CREATE_RESOURCE Enum("Fungible", 18u8) Map<String, String>("description", "Dedo test token", "name", "Dedo", "symbol", "DEDO") Map<Enum, Tuple>() Some(Enum("Fungible", Decimal("15000")));
          CALL_METHOD ComponentAddress("${address}") "deposit_batch" Expression("ENTIRE_WORKTOP");`,
      })
  }
}
