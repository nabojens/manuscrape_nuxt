import { safeResponseHandler } from '../../../../utils/safeResponseHandler';
import { requireUser } from '../../../../utils/authorize';
import { ProjectRole } from '@prisma/client';

export default safeResponseHandler(async (event) => {
  requireUser(event);
  await ensureURLResourceAccess(event, event.context.user, [ProjectRole.OWNER])
  const projectId = parseIntParam(event.context.params?.projectId);

  const dynamicFields = await prisma.dynamicProjectField.findMany({
    where: { projectId }
  });

  return { dynamicFields: dynamicFields };
});