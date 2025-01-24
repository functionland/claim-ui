export function Footer() {
    const currentYear = new Date().getFullYear()
  
    return (
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="text-gray-500 text-sm">
              © {currentYear} Token Claim Dashboard. All rights reserved.
            </div>
            
            <div className="mt-4 md:mt-0">
              <nav className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-500 hover:text-gray-900 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-gray-900 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-gray-900 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Documentation
                </a>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    )
  }
  