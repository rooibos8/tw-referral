import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { BackButton } from '@/components';
import { APPLY_STATUS, GetAppliersApiResponse } from '@/constants';
import { UserInfo } from '@/libs/firebase';

export default function Appliers() {
  const router = useRouter();
  const { listId } = router.query;
  const [appliers, setAppliers] = useState<Array<UserInfo>>([]);
  useEffect(() => {
    if (!listId) return;
    (async () => {
      const res = await fetch(`/api/form/appliers?id=${listId}`);
      const { data }: GetAppliersApiResponse = await res.json();
      setAppliers(
        data.filter((d) => d.status === APPLY_STATUS.STAY).map((d) => d.user)
      );
    })();
  }, [listId]);

  return (
    <div>
      <BackButton href="/mypage">戻る</BackButton>
      {appliers.length > 0 ? (
        <>
          {appliers.map((applier, i) => (
            <Link
              key={i}
              href={`${process.env.NEXT_PUBLIC_BASE_URL}/form/${listId}/${applier.doc_id}`}
            >
              <img
                src={applier.twitter.profile_image_url}
                alt="profile_image"
              />
              {applier.twitter.name}
              {applier.twitter.username}
              {applier.ai_guessed_age_gt !== null &&
              applier.ai_guessed_age_gt > 19 ? (
                <>19+</>
              ) : null}
            </Link>
          ))}
        </>
      ) : (
        <>おめでとうございます！</>
      )}
    </div>
  );
}
