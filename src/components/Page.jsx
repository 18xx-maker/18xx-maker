const Page = ({ title, component, current, total }) => (
  <div className="hidden print:block h-12 absolute top-0 w-full flex flex-row justify-center content-center">
    <p className="text-center">
      {title} - {component} - page {current} of {total}
    </p>
  </div>
);

export default Page;
