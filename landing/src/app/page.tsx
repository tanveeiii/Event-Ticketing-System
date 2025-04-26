import Spline from "@splinetool/react-spline/next";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col w-full h-screen overflow-hidden bg-gradient-to-b from-black to-gray-900 text-white font-sans">
      <div className="relative w-full h-full flex flex-row">
        {/* First Spline container takes up half the screen */}
        <div className="flex-1 relative md:flex-none md:w-1/2">
          <Spline
            className="absolute top-0 left-0 w-full h-full"
            scene="https://prod.spline.design/vvl9mqQdBCqPCSpu/scene.splinecode"
          />
        </div>

        {/* Text content positioned to the right with second Spline in background */}
        <div className="flex-1 relative md:flex-none md:w-1/2 z-10">
          {/* Second Spline as background */}
          <div className="absolute inset-0 z-0">
            <Spline
              className="w-full h-full"
              scene="https://prod.spline.design/nXj9XBll5N9ikwS6/scene.splinecode"
            />
          </div>

          {/* Content with higher z-index to appear above the Spline */}
          <div className="relative z-10 flex flex-col justify-center p-8 h-full">
            <div className="max-w-xl">
              <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                BlockTix
              </h1>
              <h2 className="mb-6 text-2xl md:text-3xl font-bold tracking-tight">
                Secure Event Ticketing on the Blockchain
              </h2>
              <p className="mb-8 text-lg md:text-xl text-gray-200 leading-relaxed">
                Buy, sell, and transfer event tickets with complete security and
                transparency. Our blockchain-powered platform eliminates fraud
                and enables verified reselling.
              </p>

              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <Link
                  href="/events"
                  className="px-8 py-3 text-base font-semibold rounded-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 text-center flex items-center justify-center"
                >
                  Browse Events
                </Link>
                <Link
                  href="/register"
                  className="px-8 py-3 text-base font-semibold rounded-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 text-center flex items-center justify-center"
                >
                  Get Started
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 shadow-xl transition-all duration-300 hover:bg-opacity-70">
                  <h3 className="mb-2 text-xl font-bold text-blue-300">
                    Secure Transactions
                  </h3>
                  <p className="text-gray-300">
                    Every ticket purchase is securely recorded on the blockchain
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 shadow-xl transition-all duration-300 hover:bg-opacity-70">
                  <h3 className="mb-2 text-xl font-bold text-purple-300">
                    Verified Reselling
                  </h3>
                  <p className="text-gray-300">
                    Resell your tickets at fair prices through our trusted
                    marketplace
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 shadow-xl transition-all duration-300 hover:bg-opacity-70">
                  <h3 className="mb-2 text-xl font-bold text-indigo-300">
                    Anti-Fraud Protection
                  </h3>
                  <p className="text-gray-300">
                    Say goodbye to counterfeit tickets and scalping
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
