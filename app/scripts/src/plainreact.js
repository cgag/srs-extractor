/* @flow */

// ignore errors from React.addons, rangy.init, Mousetrap.bind, etc
declare class rangy {}
declare class Mousetrap {}
declare class React {}
declare class R {} // ramda
declare class chrome {} // chrome apis

type Card = { text: string; numClozes: number }

rangy.init()

var A  = React.addons
var PT = React.PropTypes

var defaultCard = { text: ''
                  , numClozes: 1 }

function isBlank(s: string): boolean {
  return (!s || /^\s*$/.test(s));
}

var CardList = React.createClass({
  propTypes: {
    cards: PT.array.isRequired
  },
  truncate(s: string): string {
    var maxChars = 20
    if (s.length > maxChars) {
      return s.substring(0, maxChars) + '...'
    } else {
      return s
    }
  },
  render(): any {
    var cards = this.props.cards.map((card, i) => {
      return (<li key={i}>{this.truncate(card.text)}</li>)
    })
    return (
      <div className="cardList">
        <ul> 
          {cards}
        </ul>
      </div>
    )
  }
})

var SRSBox = React.createClass({
  componentDidMount(): void {

    // stay invisible until we've loaded any stored state
    chrome.storage.local.get('state', (stored) => {
      if(stored.state) {
        this.setState(stored.state)
      }
      // this.setState({visible: true})
    })

    // TODO: get bindings from config page
    Mousetrap.bind('ctrl+i', this.insertSelection)
    Mousetrap.bind('ctrl+;', () => { 
      this.setState({visible: !this.state.visible})
      this.storeState(this.state) 
    })

    // saving cards doesn't set state, just modifies storage, we set
    // the state when we detect changed in storage
    chrome.storage.onChanged.addListener((changes, namespace) => {
      this.setState(changes.state.newValue)
    })
  },
  storeState(state) {
    chrome.storage.local.set({'state': state}, () => {})
  },
  getInitialState(): { savedCards: [Card];
                       currentCard: Card;
                       visible: boolean } {
    return { savedCards: []
           , currentCard: defaultCard
           , visible: false
           }
  },
  saveCard(card: Card): void {
    var currCard = this.state.currentCard
    if(!isBlank(currCard.text)) {
      this.storeState(A.update(this.state,  
                            { savedCards:  {$unshift: [currCard]}
                            , currentCard: {$set: defaultCard}}))
    }
  },
  insertSelection(): void {
    this.setState({currentCard: {text: rangy.getSelection().toString()}})
  },
  makeCloze(): void {
    var clozeSel = function(s, selection, clozeNum) {
      var selectedText = selection.text
      var start = selection.start
      var end = selection.end
      if (!isBlank(selectedText)) {
        return s.substring(0, start) 
               + '{{c' 
               + clozeNum
               + '::'
               + selectedText 
               + '}}' 
               + s.substring(end)
      } else {
        return s
      }
    }

    var clozeText = 
      clozeSel( this.state.currentCard.text
              , $(this.refs.srsTextarea.getDOMNode()).getSelection()
              , this.state.currentCard.numClozes)

    // Don't make clozes if they don't change anything. This keeps
    // numClozes correct if nothing is selected.
    if (clozeText !== this.state.currentCard.text) {
      this.setState(A.update(this.state,
        {currentCard: 
          { text: {$set: clozeText }
          , numClozes: {$apply: R.inc }}}))
    }
  },
  downloadCards(): void {
    function download(filename, text) {
      var pom = document.createElement('a');
      pom.setAttribute('href'
          , 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      pom.setAttribute('download', filename);
      pom.click();
    }
    
    var ankiFormattedCards = this.state.savedCards.map((card) => {
      return '\"' + card.text + '\";'
    }).join('\n')
    
    download('exportForAnki.txt', ankiFormattedCards)
  },
  handleInput(event): void {
    this.setState(A.update(this.state, 
                            {currentCard: 
                              {text: {$set: event.target.value}}}))
  },
  render(): any {
    return !this.state.visible ? null :
      <div id='srsContainer'>
        <textarea value={this.state.currentCard.text} 
                  onChange={this.handleInput} 
                  ref='srsTextarea' />
        <div className="srsButtons">
          <button onClick={this.insertSelection}>Insert</button>
          <button onClick={this.makeCloze}>[...]</button>
          <button onClick={this.saveCard}>Save Card</button>
          <button onClick={this.downloadCards}>Export</button>
        </div>
        <CardList cards={this.state.savedCards} />
      </div>
  }
})

React.render(
    <SRSBox />
  , document.getElementById('incReadingExtension')
);
