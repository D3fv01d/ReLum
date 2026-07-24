FROM node:24-alpine

WORKDIR /app

COPY src/shared/challengeCatalog.js ./src/shared/challengeCatalog.js
COPY labs/relum-lab ./labs/relum-lab

RUN addgroup -g 10001 relum && \
    adduser -D -H -u 10001 -G relum relum && \
    mkdir -p /challenge /tmp/relum-lab && \
    chown -R relum:relum /challenge /tmp/relum-lab /app

ENV NODE_ENV=production \
    PORT=8080 \
    RELUM_LAB_ISOLATED=1 \
    RELUM_CHALLENGE_DIR=/challenge

USER 10001:10001

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8080/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "labs/relum-lab/src/server.js"]
