FROM public.ecr.aws/lambda/python:3.12

COPY ./terraform ${LAMBDA_TASK_ROOT}
COPY ./terraform-provider-aws_v5.43.0_x5 ${LAMBDA_TASK_ROOT}
COPY ./.terraform.lock.hcl ${LAMBDA_TASK_ROOT}

RUN chmod +x /var/task
RUN dnf install git -y
RUN dnf clean all
RUN pip install requests

COPY ./lambda.py ${LAMBDA_TASK_ROOT}
COPY ./main.tf ${LAMBDA_TASK_ROOT}

CMD ["lambda.handler"]