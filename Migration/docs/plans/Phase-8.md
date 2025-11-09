# Phase 8: Backend Migration to AWS Lambda

**Estimated Tokens:** TBD (detailed plan to be created after Phase 1-7 completion)
**Dependencies:** Phase 7 (Client app fully functional with existing microservices)
**Goal:** Migrate Python microservices from Google Cloud Run to AWS Lambda + API Gateway.

---

## Phase Goal

Replace the existing Python microservices with AWS Lambda functions, providing better control over infrastructure, costs, and security. By the end of this phase:

1. FinBERT sentiment analysis running on AWS Lambda
2. Logistic regression predictions running on AWS Lambda
3. AWS API Gateway configured as unified endpoint
4. React Native client updated to use new endpoints
5. API key protection and rate limiting implemented

**Success Criteria:**
- [ ] Both Lambda functions deployed and functional
- [ ] API Gateway routes configured correctly
- [ ] Client app works identically with new backend
- [ ] API keys protected server-side (not exposed in client)
- [ ] Rate limiting prevents abuse
- [ ] Costs optimized (provisioned concurrency for sentiment Lambda if needed)

---

## Current State (After Phase 7)

**Existing Services:**
- Sentiment Analysis: `https://stocks-backend-sentiment-f3jmjyxrpq-uc.a.run.app`
- Prediction: `https://stocks-f3jmjyxrpq-uc.a.run.app`

**Client Integration:**
- Services called via `sentiment.service.ts` and `prediction.service.ts`
- Endpoints configured in `src/constants/api.constants.ts`
- TypeScript interfaces defined in `src/types/api.types.ts`

---

## Migration Strategy

### Option 1: Port Python to Node.js (Recommended for Lambda)

**Pros:**
- Better cold start performance (~500ms vs 3-5s for Python)
- Smaller deployment packages
- Unified language with client (TypeScript/JavaScript)

**Cons:**
- Requires porting Python logic to JavaScript
- Need JavaScript FinBERT library (use `@xenova/transformers`)
- Need to retrain/convert logistic regression model

### Option 2: Keep Python (Container Lambda)

**Pros:**
- Minimal code changes (copy existing Python logic)
- Can use same FinBERT model and scikit-learn

**Cons:**
- Slower cold starts (3-5s with container images)
- Larger deployment packages (~500MB vs ~50MB for Node.js)
- Higher costs (need provisioned concurrency)

**Recommendation:** Start with Option 2 (Python container Lambda) for faster migration, optimize to Node.js (Option 1) later if needed.

---

## High-Level Tasks (Detailed Plan TBD)

### Task 1: Investigate Python Microservice Repos

- Clone/access `python-sentiment-analysis` and `python-logistic-prediction` repos
- Document all dependencies, environment variables, model files
- Understand request/response contracts (already documented in Phase-2.md)
- Identify any external dependencies (databases, other services)

### Task 2: Set Up AWS Infrastructure

- Create AWS Lambda functions (one for sentiment, one for predictions)
- Set up API Gateway with routes (`/sentiment`, `/predict`)
- Configure IAM roles and permissions
- Set up CloudWatch logging

### Task 3: Deploy FinBERT Sentiment Lambda

- Package Python code + FinBERT model into container image
- Deploy to AWS Lambda (container mode)
- Configure memory (2048MB recommended for FinBERT)
- Test with sample requests

### Task 4: Deploy Prediction Lambda

- Package Python code + logistic regression model
- Deploy to AWS Lambda
- Configure memory (512MB should suffice)
- Test with sample requests

### Task 5: Configure API Gateway

- Set up REST API with two routes
- Add request validation
- Configure CORS for React Native client
- Add rate limiting (e.g., 100 req/minute per IP)
- Optional: Add API key authentication

### Task 6: Update Client App

- Update `API_ENDPOINTS` in `src/constants/api.constants.ts`
- Point to new API Gateway URLs
- No other code changes needed (contracts maintained)
- Test end-to-end with new backend

### Task 7: Performance Optimization

- Analyze cold start times
- Consider provisioned concurrency for sentiment Lambda (costly but eliminates cold starts)
- Implement caching in API Gateway if beneficial
- Monitor CloudWatch metrics

### Task 8: Security Hardening

- Move Tiingo and Polygon API keys to Lambda environment variables (remove from client)
- Implement request signing or JWT authentication
- Add input validation and sanitization
- Set up AWS WAF for DDoS protection (if needed)

### Task 9: Cost Optimization

- Analyze Lambda invocation patterns
- Right-size memory allocations
- Consider moving to Node.js if Python costs too high
- Set up billing alerts

---

## Prerequisites for Phase 8

Before starting Phase 8, ensure:
- [ ] Phase 1-7 complete and client app fully functional
- [ ] Access to original Python microservice repositories
- [ ] AWS account with appropriate permissions
- [ ] Understanding of AWS Lambda, API Gateway basics
- [ ] Decision on Python vs Node.js approach

---

## Estimated Costs (AWS Lambda)

**Assumptions:**
- 1,000 users
- Each user analyzes 10 articles/day
- 10,000 sentiment analyses/day = ~300,000/month
- 10,000 predictions/day = ~300,000/month

**Lambda Costs (Python Container, No Provisioned Concurrency):**
- Sentiment (2048MB, 5s avg): ~$30-50/month
- Prediction (512MB, 1s avg): ~$5-10/month
- **Total:** ~$35-60/month

**With Provisioned Concurrency (to eliminate cold starts):**
- Add ~$20-40/month for always-warm sentiment Lambda
- **Total:** ~$55-100/month

**API Gateway:**
- 600,000 requests/month = ~$2/month

**Note:** Costs scale with usage. Monitor and optimize as needed.

---

## Testing Strategy

1. **Unit Tests**: Test Lambda functions locally with sample requests
2. **Integration Tests**: Test API Gateway → Lambda flow
3. **E2E Tests**: Test React Native client → API Gateway → Lambda
4. **Load Tests**: Simulate high traffic to identify bottlenecks
5. **Regression Tests**: Verify responses match original Python services

---

## Rollback Plan

If migration fails or issues arise:
1. Revert client `API_ENDPOINTS` to original Python services
2. Lambda functions can coexist with old services during transition
3. Use feature flag to gradually roll out new backend

---

## Future Enhancements (Phase 9+)

After successful Lambda migration, consider:
- **Phase 9A**: Port to Node.js for better cold start performance
- **Phase 9B**: Implement on-device ML with ONNX Runtime (eliminate backend calls entirely)
- **Phase 9C**: Add advanced features (charts, push notifications, dark mode)

---

## Notes

This is a **placeholder outline**. A detailed implementation plan for Phase 8 will be created after Phases 1-7 are complete and the client app is fully functional.

**Why wait?**
- Backend migration is complex and requires dedicated focus
- Client migration is higher priority (delivers user-facing value faster)
- Requirements may change after real-world testing with Phase 1-7
- Team can gain experience with React Native before tackling Lambda deployment

---

## References

- **Original Microservices**:
  - Sentiment: https://github.com/HatmanStack/python-sentiment-analysis
  - Prediction: https://github.com/HatmanStack/python-logistic-prediction
- **AWS Lambda Docs**: https://docs.aws.amazon.com/lambda/
- **API Gateway Docs**: https://docs.aws.amazon.com/apigateway/
- **FinBERT (Hugging Face)**: https://huggingface.co/ProsusAI/finbert
- **Transformers.js (for Node.js alternative)**: https://huggingface.co/docs/transformers.js

---

**Status:** PLANNING PHASE - Detailed implementation plan to be created after Phase 7 completion.
