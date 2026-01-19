const AllPayments = ({ darkMode, collapsed }) => {
    return (
        <div className={`text-center text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome to the All Payments Page
        </div>
    );
}
export default AllPayments;