import { Fragment } from "react";
const RootPage = () => {
  return (
    <Fragment>
      <div className="h-full p-4 space-y-2 mx-8">
        <h1
          className={
            "hidden md:block text-xl md:text-3xl font-bold text-primary"
          }
        >
         Dashboard
        </h1>
      </div>
    </Fragment>
  );
};
export default RootPage;
