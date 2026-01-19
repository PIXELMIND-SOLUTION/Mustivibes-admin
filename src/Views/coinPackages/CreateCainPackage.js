const CreateCoinPackage = ({ darkMode, collapsed }) => {
    return (
        <div className={`text-center text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome to the Coin Packages Creation Page
        </div>
    );
}
export default CreateCoinPackage;