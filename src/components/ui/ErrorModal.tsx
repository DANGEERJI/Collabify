//src/components/ui/ErrorModal
import { Dispatch, SetStateAction } from "react";


interface ErrorModalProps{
   showModal: boolean,
   setShowModal: Dispatch<SetStateAction<boolean>>,
   errorMessage: string,
   setErrorMessage: Dispatch<SetStateAction<string>>,
}

export const ErrorModal= ({showModal, setShowModal, errorMessage, setErrorMessage}: ErrorModalProps) => {
   if (!showModal) return null;

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
         <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
               <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
               </svg>
            </div>
            <div>
               <h3 className="text-lg font-semibold text-gray-900">Error 🚫</h3>
            </div>
         </div>

         <p className="text-gray-600 mb-6">
            {errorMessage}
         </p>

         <div className="flex gap-3">
            <button
            onClick={() => {
               setShowModal(false);
               setErrorMessage("");
            }}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
            Cancel
            </button>
         </div>
      </div>
      </div>
   );
};