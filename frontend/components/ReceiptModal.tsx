'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { PredictionReceipt } from '@/lib/api';
import { format } from 'date-fns';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: PredictionReceipt | null;
}

export default function ReceiptModal({ isOpen, onClose, receipt }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!receipt) return null;

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  };

  const handleDownload = () => {
    if (receiptRef.current === null) {
      return;
    }

    toPng(receiptRef.current, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${slugify(receipt.title)}-receipt.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Failed to generate image', err);
      });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 border-b pb-4"
                >
                  Prediction Receipt
                </Dialog.Title>
                
                {/* This is the section we will capture as an image */}
                <div ref={receiptRef} className="bg-white pt-5 pb-2 px-2">
                  <div className="text-center mb-4">
                      <h4 className="text-xl font-bold text-gray-800 break-words">{receipt.title}</h4>
                  </div>
                  <div className="flex justify-center">
                    <QRCodeCanvas
                      value={receipt.verification_url}
                      size={256}
                      bgColor={"#ffffff"}
                      fgColor={"#000000"}
                      level={"L"}
                      includeMargin={true}
                    />
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500 space-y-2">
                    <p className='break-all'><strong>Timestamp:</strong> {format(new Date(receipt.timestamp), "MMMM d, yyyy 'at' h:mm:ss a zzz")}</p>
                    <p className='break-all'><strong>User:</strong> @{receipt.user_handle}</p>
                    <p className='break-all'><strong>Hash (SHA-256):</strong> {receipt.hash}</p>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary-100 px-4 py-2 text-sm font-medium text-primary-900 hover:bg-primary-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                    onClick={handleDownload}
                  >
                    Download Proof
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}