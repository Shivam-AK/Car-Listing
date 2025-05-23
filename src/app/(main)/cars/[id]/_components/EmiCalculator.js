"use client";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/helper";
import { DollarSign, Percent } from "lucide-react";
import { useEffect, useState } from "react";

export default function EmiCalculator({
  price = 1000,
  interest = 5,
  term = 5,
}) {
  const [loanAmount, setLoanAmount] = useState(price);
  const [downPayment, setDownPayment] = useState(0);
  const [downPaymentPercent, setDownPaymentPercent] = useState(0);
  const [interestRate, setInterestRate] = useState(interest);
  const [loanTenure, setLoanTenure] = useState(term);
  const [results, setResults] = useState(null);

  const handleLoanAmountChange = (value) => {
    const newLoanAmount = Math.min(Math.max(value, 1000), 200000);
    setLoanAmount(newLoanAmount);
    const newDownPayment = (downPaymentPercent / 100) * newLoanAmount;
    setDownPayment(newDownPayment);
    calculateLoan(newLoanAmount, newDownPayment, interestRate, loanTenure);
  };

  const handleDownPaymentChange = (value) => {
    const newDownPayment = Math.min(Math.max(value, 0), loanAmount);
    setDownPayment(newDownPayment);
    setDownPaymentPercent((newDownPayment / loanAmount) * 100);
    calculateLoan(loanAmount, newDownPayment, interestRate, loanTenure);
  };

  const handleDownPaymentPercentChange = (percent) => {
    const newPercent = Math.min(Math.max(percent, 0), 100);
    setDownPaymentPercent(newPercent);
    const newDownPayment = (newPercent / 100) * loanAmount;
    setDownPayment(newDownPayment);
    calculateLoan(loanAmount, newDownPayment, interestRate, loanTenure);
  };

  const handleInterestRateChange = (value) => {
    const newRate = Math.min(Math.max(value, 0.1), 25);
    setInterestRate(newRate);
    calculateLoan(loanAmount, downPayment, newRate, loanTenure);
  };

  const handleLoanTenureChange = (value) => {
    const newTenure = Math.min(Math.max(value, 1), 8);
    setLoanTenure(newTenure);
    calculateLoan(loanAmount, downPayment, interestRate, newTenure);
  };

  const calculateLoan = (principal, down, rate, years) => {
    const loanPrincipal = principal - down;
    if (loanPrincipal <= 0) {
      setResults(null);
      return;
    }

    const monthlyRate = rate / 100 / 12;
    const months = years * 12;

    const emi =
      (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - loanPrincipal;

    setResults({
      emi: emi.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      loanPrincipal: loanPrincipal.toFixed(2),
      downPayment: down.toFixed(2),
    });
  };

  useEffect(() => {
    calculateLoan(loanAmount, downPayment, interestRate, loanTenure);
  }, []);

  return (
    <div className="max-h-[80vh] w-full overflow-y-auto">
      <div className="w-full">
        <div className="space-y-4">
          <div className="rounded-xl bg-gray-50 p-4">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Vehicle Price
            </h2>
            <div className="space-y-3">
              <div className="relative">
                <DollarSign className="absolute top-2.5 left-2.5 size-4 text-gray-700" />
                <Input
                  type="number"
                  value={loanAmount}
                  onChange={(e) =>
                    handleLoanAmountChange(parseFloat(e.target.value))
                  }
                  className="pl-8"
                />
              </div>

              <Slider
                max="200000"
                step={10}
                value={[loanAmount]}
                onValueChange={(value) =>
                  handleLoanAmountChange(parseFloat(value))
                }
              />
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Down Payment
            </h2>
            <div className="space-y-3">
              <div className="relative">
                <DollarSign className="absolute top-2.5 left-2.5 size-4 text-gray-700" />
                <Input
                  type="number"
                  value={downPayment}
                  onChange={(e) =>
                    handleDownPaymentChange(parseFloat(e.target.value))
                  }
                  className="pl-8"
                />
              </div>
              <Slider
                max={loanAmount}
                step={10}
                value={[downPayment]}
                onValueChange={(value) =>
                  handleDownPaymentChange(parseFloat(value))
                }
              />
              <div className="text-sm text-gray-600">
                Down payment: {downPaymentPercent.toFixed(1)}% of vehicle price
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                Interest Rate
              </h2>
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    value={interestRate}
                    onChange={(e) =>
                      handleInterestRateChange(parseFloat(e.target.value))
                    }
                    className="pr-10"
                  />
                  <Percent className="absolute top-2.5 right-2.5 size-4 text-gray-700" />
                </div>
                <Slider
                  max="25"
                  step="0.01"
                  value={[interestRate]}
                  onValueChange={(value) =>
                    handleInterestRateChange(parseFloat(value))
                  }
                />
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                Loan Term
              </h2>
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type="number"
                    value={loanTenure}
                    onChange={(e) =>
                      handleLoanTenureChange(parseFloat(e.target.value))
                    }
                    className="pr-16"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-700">Years</span>
                  </div>
                </div>
                <Slider
                  max="8"
                  value={[loanTenure]}
                  onValueChange={(value) =>
                    handleLoanTenureChange(parseFloat(value))
                  }
                />
              </div>
            </div>
          </div>

          {results && (
            <div className="mt-4 rounded-xl bg-gray-50 p-4">
              <div className="mb-4 text-center">
                <div className="text-sm text-gray-700">Monthly Payment</div>
                <div className="mt-1 text-3xl font-bold text-gray-900">
                  {formatCurrency(results.emi)}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-white p-3">
                  <div className="text-sm text-gray-700">Vehicle Price</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">
                    {formatCurrency(loanAmount)}
                  </div>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <div className="text-sm text-gray-700">Down Payment</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">
                    {formatCurrency(results.downPayment)}
                  </div>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <div className="text-sm text-gray-700">Loan Amount</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">
                    {formatCurrency(results.loanPrincipal)}
                  </div>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <div className="text-sm text-gray-700">Total Interest</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">
                    {formatCurrency(results.totalInterest)}
                  </div>
                </div>

                <div className="rounded-lg bg-white p-3 md:col-span-2">
                  <div className="text-sm text-gray-700">
                    Total Amount (Down Payment + Total Payments)
                  </div>
                  <div className="mt-1 text-lg font-bold text-gray-900">
                    {formatCurrency(
                      parseFloat(results.downPayment) +
                        parseFloat(results.totalPayment)
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-gray-700">
            This is an estimate. Actual EMI may vary based on your credit score
            and lender terms.
          </p>
        </div>
      </div>
    </div>
  );
}
