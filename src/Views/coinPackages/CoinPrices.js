const CoinPrices = ({ darkMode, collapsed }) => {
    return (
        <div className={`text-center text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome to the Coin Prices Page
        </div>
    );
}
export default CoinPrices;