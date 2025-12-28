function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-50 px-4">
      
      {/* Login Card */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-md lg:max-w-md bg-white rounded-xl shadow-lg p-8 sm:p-10 border border-gray-200">
        
        {/* Logo / Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-600 mb-2">
          MediCare
        </h2>
        <p className="text-center text-gray-600 mb-8 text-sm sm:text-base">
          Securely login to your account
        </p>

        {/* Form */}
        <form className="space-y-5 sm:space-y-6">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 sm:py-3 text-sm sm:text-base
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 sm:py-3 text-sm sm:text-base
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Login Button */}
          <button
            className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium
                       hover:bg-blue-700 transition-shadow shadow-md"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-3 text-gray-400 text-sm">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Register link */}
        <p className="text-center text-gray-600 text-sm sm:text-base">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 font-medium hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
