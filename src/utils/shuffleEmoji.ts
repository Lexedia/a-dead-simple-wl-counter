export const emojiList = ['bingusblanket.png', 'wires.png', 'huh.gif', 'explod.gif', 'clueless.gif'];

export default () => {
    if (emojiList.length > 0) {
        const randomIndex = Math.floor(Math.random() * emojiList.length);
        return emojiList[randomIndex];
    } else {
        return null;
    }
};
