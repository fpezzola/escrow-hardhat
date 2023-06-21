import Escrow, { STATUS_COLOR } from "./Escrow";
import Input from "./components/Input";
import Button from "./components/Button";
import Card from "./components/Card";
import { ethers } from "ethers";
import useEscrows from "./useEscrows";
import useCreateEscrow from "./useCreateEscrow";
import * as Accordion from "@radix-ui/react-accordion";
import { twMerge } from "tailwind-merge";
import { forwardRef, useRef, useState } from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons";

const EXPIRATIONS = {
  0: {
    label: "None",
  },
  60: {
    label: "1 minute",
  },
  1800: {
    label: "30 minutes",
  },
  3600: {
    label: "1 hour",
  },
  86400: {
    label: "1 day",
  },
};

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

const AccordionTrigger = forwardRef(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Header className="AccordionHeader">
      <Accordion.Trigger
        className={twMerge("AccordionTrigger", className)}
        {...props}
        ref={forwardedRef}
      >
        {children}
        <ChevronDownIcon className="AccordionChevron" aria-hidden />
      </Accordion.Trigger>
    </Accordion.Header>
  )
);

const AccordionContent = forwardRef(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Content
      className={twMerge("AccordionContent", className)}
      {...props}
      ref={forwardedRef}
    >
      <div className="AccordionContentText">{children}</div>
    </Accordion.Content>
  )
);

const getStatus = (escrow) => {
  const currentStatus = escrow.status;
  if (currentStatus !== 0 || parseInt(escrow.expiresAt) === 0) {
    return currentStatus;
  }
  const expirationDate = new Date(parseInt(escrow.expiresAt) * 1000);
  return expirationDate.getTime() > new Date().getTime() ? currentStatus : 2;
};

function Dashboard() {
  const formRef = useRef();
  const [expiration, setExpiration] = useState("0");
  const { newEscrow, isLoading: isCreating } = useCreateEscrow();
  const { data: escrows, refetch } = useEscrows();
  async function submitForm(e) {
    e.preventDefault();
    const { beneficiary, arbiter, eth, name } = e.target.elements;
    if (!beneficiary.value || !arbiter.value || !eth.value) {
      return alert("You must specify beneficiary, arbiter and deposit value");
    }
    const wei = ethers.parseUnits(eth.value, 18);
    try {
      await newEscrow(
        name.value,
        arbiter.value,
        beneficiary.value,
        wei,
        parseInt(expiration)
      );
      formRef.current.reset();
      await refetch();
      alert("Created!");
    } catch (e) {
      console.log(e);
    }
  }

  const handleApprove = async (approveFn) => {
    try {
      await approveFn();
      refetch();
      alert("Approved!");
    } catch (e) {
      console.log(e);
    }
  };

  const handleClaimBack = async (claimFn) => {
    try {
      await claimFn();
      refetch();
      alert("Claimed!");
    } catch (e) {
      console.log(e);
    }
  };

  const parsedEscrows = escrows?.map((escrow) => {
    return {
      ...escrow,
      status: getStatus(escrow),
    };
  });
  console.log(parsedEscrows);
  return (
    <div className="flex flex-row space-x-2 w-full">
      <Card className="flex-1">
        <h1 className="text-xl font-bold mb-4"> New Contract</h1>
        <form onSubmit={submitForm} ref={formRef}>
          <label>
            Escrow name
            <Input name="name" />
          </label>
          <label>
            Arbiter Address
            <Input name="arbiter" />
          </label>

          <label>
            Beneficiary Address
            <Input name="beneficiary" />
          </label>

          <label>
            Deposit Amount (in Eth)
            <Input name="eth" />
          </label>
          <label>
            Expiration
            <div className="flex flex-row space-x-2 mt-2">
              {Object.keys(EXPIRATIONS).map((timeInSeconds) => {
                return (
                  <div
                    key={timeInSeconds}
                    className={twMerge(
                      "bg-white border  text-xs p-2 rounded-md text-black",
                      timeInSeconds === expiration
                        ? "bg-sky-200 border-black"
                        : " border-gray-200 bg-white cursor-pointer"
                    )}
                    onClick={() => setExpiration(timeInSeconds)}
                  >
                    {EXPIRATIONS[timeInSeconds].label}
                  </div>
                );
              })}
            </div>
          </label>
          <div className="flex flex-row justify-center mr-8">
            <Button name="deploy" type="submit" className="ml-auto">
              Deploy escrow
            </Button>
          </div>
        </form>
      </Card>
      <Card>
        <h1 className="text-xl font-bold mb-4"> Existing Contracts </h1>

        <div id="container">
          {!parsedEscrows || parsedEscrows.length === 0 ? (
            <span className="m-auto">There are no contracts deployed.</span>
          ) : (
            <Accordion.Root
              className="AccordionRoot"
              type="single"
              collapsible
              defaultValue=""
            >
              {parsedEscrows?.map((escrow) => {
                return (
                  <Accordion.Item
                    key={escrow.contractAddress}
                    className="AccordionItem"
                    value={escrow.contractAddress}
                  >
                    <AccordionTrigger>
                      <span className="flex flex-row space-x-2 items-center">
                        <span
                          className={twMerge(
                            STATUS_COLOR[escrow.status],
                            "w-2 rounded-full h-2"
                          )}
                        ></span>
                        <span>{escrow.name}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Escrow
                        {...escrow}
                        handleApprove={handleApprove}
                        handleClaim={handleClaimBack}
                      />
                    </AccordionContent>
                  </Accordion.Item>
                );
              })}
            </Accordion.Root>
          )}
        </div>
      </Card>
    </div>
  );
}

export default Dashboard;
