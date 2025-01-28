function initializeGame(player1, player2) {
    return {
        gameId: `${player1.id}-${player2.id}`,
        players: [player1, player2],
        deck: generateDeck(),
        scores: { [player1.id]: 0, [player2.id]: 0 },
    };
}

function generateDeck() {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    return suits.flatMap((suit) => values.map((value) => ({ suit, value })));
}

function drawCard(playerId, game) {
    const cardIndex = Math.floor(Math.random() * game.deck.length);
    const card = game.deck.splice(cardIndex, 1)[0];
    const opponent = game.players.find((p) => p.id !== playerId);

    const opponentCardIndex = Math.floor(Math.random() * game.deck.length);
    const opponentCard = game.deck.splice(opponentCardIndex, 1)[0];

    const winner =
        getCardValue(card.value) > getCardValue(opponentCard.value) ? playerId : opponent.id;

    // Update scores
    if (winner === playerId) {
        game.scores[playerId]++;
    } else {
        game.scores[opponent.id]++;
    }

    return {
        playerCard: card,
        opponentCard,
        winner,
        scores: game.scores,
    };
}

function getCardValue(value) {
    const values = {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
        J: 11, Q: 12, K: 13, A: 14,
    };
    return values[value];
}

module.exports = { initializeGame, drawCard };
