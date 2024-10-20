'use client'

import { useState } from 'react';
import { Center, Select, Group, Button, Text, Notification } from "@mantine/core";
// import { useCategories, useComplexities } from './hooks'; // Adjust the path as needed
<<<<<<< HEAD
=======
// import LoadingModal from './LoadingModal'; // Adjust the path as needed
>>>>>>> 3fe6a0de45f898140f7c3a3e1a4818318c9c4f92
import FindMatch from '@/components/find-match';

export default function MatchPage() {
  // const { categories, categoriesLoading, categoriesError } = useCategories();
  // const { complexities, complexitiesLoading, complexitiesError } = useComplexities();
  
  // const [selectedComplexity, setSelectedComplexity] = useState(null);
  // const [selectedCategory, setSelectedCategory] = useState(null);
  // const [isLoading, setLoading] = useState(false);
  // const [isTimeout, setTimeout] = useState(false);
  
  // const handleFindMatch = () => {
  //   setLoading(true);
  //   setTimeout(false);

  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //     setTimeout(true);
  //   }, 30000); // 30 seconds

  //   // Simulate finding a match
  //   setTimeout(() => {
  //     clearTimeout(timer);
  //     setLoading(false);
  //     setTimeout(true); // Show timeout after 30 seconds
  //   }, 20000); // Simulate a match found in 20 seconds
  // };

  // const handleCancel = () => {
  //   setLoading(false);
  // };

  // // Show loading indicator while fetching categories or complexities
  // if (categoriesLoading || complexitiesLoading) {
  //   return <Loader />;
  // }

  // // Show error notification if fetching categories or complexities failed
  // if (categoriesError || complexitiesError) {
  //   return (
  //     <Notification color="red" title="Error">
  //       {categoriesError?.message || complexitiesError?.message}
  //     </Notification>
  //   );
  // }

<<<<<<< HEAD
  return (
    <Center h="80vh">
      {/* <div>
        <Text>Select Complexity</Text>
        <Select
          data={complexities.map(c => ({ value: c.id, label: c.name }))}
          placeholder="Choose complexity"
          value={selectedComplexity}
          onChange={setSelectedComplexity}
        />
=======
  // return (
  //   <Center h="80vh">
  //     <div>
  //       <Text>Select Complexity</Text>
  //       <Select
  //         data={complexities.map(c => ({ value: c.id, label: c.name }))}
  //         placeholder="Choose complexity"
  //         value={selectedComplexity}
  //         onChange={setSelectedComplexity}
  //       />
>>>>>>> 3fe6a0de45f898140f7c3a3e1a4818318c9c4f92

  //       <Text>Select Category</Text>
  //       <Select
  //         data={categories.map(c => ({ value: c.id, label: c.name }))}
  //         placeholder="Choose category"
  //         value={selectedCategory}
  //         onChange={setSelectedCategory}
  //       />

<<<<<<< HEAD
        <FindMatch questionId={456}/ >

        <Notification
          title="Timeout"
          opened={isTimeout}
          onClose={() => setTimeout(false)}
          color="red"
        >
          Your match search has timed out.
        </Notification>
      </div> */}
      <FindMatch questionId={456} />
    </Center>
  );
=======
  //       <FindMatch questionId={456}/>

  //       <LoadingModal
  //         opened={isLoading}
  //         onClose={handleCancel}
  //         onCancel={handleCancel}
  //       />

  //       <Notification
  //         title="Timeout"
  //         opened={isTimeout}
  //         onClose={() => setTimeout(false)}
  //         color="red"
  //       >
  //         Your match search has timed out.
  //       </Notification>
  //     </div>
  //   </Center>
  // );
>>>>>>> 3fe6a0de45f898140f7c3a3e1a4818318c9c4f92
}
